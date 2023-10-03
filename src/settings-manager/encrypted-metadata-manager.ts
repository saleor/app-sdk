import crypto from "crypto";

import { MetadataManager, MetadataManagerConfig } from "./metadata-manager";
import { DeleteSettingsValue, SettingsManager, SettingsValue } from "./settings-manager";

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
    deleteMetadata,
  }: EncryptedMetadataManagerConfig) {
    this.metadataManager = new MetadataManager({
      fetchMetadata,
      mutateMetadata,
      deleteMetadata,
    });
    if (encryptionKey) {
      this.encryptionKey = encryptionKey;
    } else {
      console.warn("Encrypted Metadata Manager secret key has not been set.");
      if (process.env.NODE_ENV === "production") {
        console.error("Can't start the application without the secret key.");
        throw new Error(
          "Encryption key for the EncryptedMetadataManager has not been set. Setting it for the production environments is necessary. You can find more in the documentation: https://docs.saleor.io/docs/3.x/developer/extending/apps/developing-apps/app-sdk/settings-manager"
        );
      }
      console.warn(
        "WARNING: Encrypted Metadata Manager encryption key has not been set. For production deployments, it need's to be set"
      );
      console.warn("Using placeholder value for the development.");
      this.encryptionKey = "CHANGE_ME";
    }
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

  async delete(args: DeleteSettingsValue | DeleteSettingsValue[] | string | string[]) {
    await this.metadataManager.delete(args);
  }
}
