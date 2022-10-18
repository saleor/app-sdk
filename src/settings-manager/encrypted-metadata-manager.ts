import crypto from "crypto";

import { MetadataManager, MetadataManagerConfig } from "./metadata-manager";
import { SettingsManager, SettingsValue } from "./settings-manager";

export type EncryptCallback = (value: string, secret: string) => string;

export type DecryptCallback = (value: string, secret: string) => string;

/**
 * Ensures key has constant length of 32 characters
 */
const prepareKey = (key: string) =>
  crypto.createHash("sha256").update(String(key)).digest("base64").substr(0, 32);

/**
 * Encrypt string using AES-256
 */
export const encrypt = (data: string, key: string) => {
  const iv = crypto.randomBytes(16).toString("hex").slice(0, 16);
  const cipher = crypto.createCipheriv("aes256", prepareKey(key), iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv}${encrypted}`;
};

/**
 * Decrypt string encrypted with AES-256
 */
export const decrypt = (data: string, key: string) => {
  const [iv, encrypted] = [data.slice(0, 16), data.slice(16)];
  const decipher = crypto.createDecipheriv("aes256", prepareKey(key), iv);
  let message = decipher.update(encrypted, "hex", "utf8");
  message += decipher.final("utf8");

  return message;
};

interface EncryptedMetadataManagerConfig extends MetadataManagerConfig {
  encryptionKey: string;
  encryptionMethod?: EncryptCallback;
  decryptionMethod?: DecryptCallback;
}

/**
 * Encrypted Metadata Manager use app metadata to store settings.
 * To minimize network calls, once fetched metadata are cached.
 * Cache invalidation occurs if any value is set.
 *
 * By default data encryption use AES-256 algorithm. If you want to use a different
 * method, provide `encryptionMethod` and `decryptionMethod`.
 */
export class EncryptedMetadataManager implements SettingsManager {
  private encryptionKey: string;

  private encryptionMethod: EncryptCallback;

  private decryptionMethod: DecryptCallback;

  private metadataManager: MetadataManager;

  constructor({
    fetchMetadata,
    mutateMetadata,
    encryptionKey,
    encryptionMethod,
    decryptionMethod,
  }: EncryptedMetadataManagerConfig) {
    this.metadataManager = new MetadataManager({
      fetchMetadata,
      mutateMetadata,
    });
    this.encryptionKey = encryptionKey;
    this.encryptionMethod = encryptionMethod || encrypt;
    this.decryptionMethod = decryptionMethod || decrypt;
  }

  async get(key: string, domain?: string) {
    const encryptedValue = await this.metadataManager.get(key, domain);
    if (!encryptedValue) {
      return undefined;
    }
    return this.decryptionMethod(encryptedValue, this.encryptionKey);
  }

  async set(settings: SettingsValue[] | SettingsValue) {
    if (!Array.isArray(settings)) {
      const encryptedValue = this.encryptionMethod(settings.value, this.encryptionKey);
      return this.metadataManager.set({ ...settings, value: encryptedValue });
    }
    const encryptedSettings = settings.map((s) => ({
      ...s,
      value: this.encryptionMethod(s.value, this.encryptionKey),
    }));
    return this.metadataManager.set(encryptedSettings);
  }
}
