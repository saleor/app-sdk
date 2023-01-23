import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DecryptCallback,
  EncryptCallback,
  EncryptedMetadataManager,
} from "./encrypted-metadata-manager";
import { MetadataEntry } from "./metadata-manager";

const initialEntry = { key: "a", value: "without domain" };
const encryptedEntry = {
  key: "encrypted",
  value: "ddd891446804916e3b2cba1fad9f4ebf9643e1a56794e8a9",
}; // the value is encrypted string `new value`

const entryForDomainX = { key: "a__x.com", value: "domain x value" };
const entryForDomainY = { key: "a__y.com", value: "domain y value" };

const metadata = [initialEntry, entryForDomainX, entryForDomainY, encryptedEntry];

describe("settings-manager", () => {
  describe("encrypted-metadata-manager", () => {
    describe("Constructor", () => {
      const initialEnv = { ...process.env };

      afterEach(() => {
        process.env = { ...initialEnv };
        vi.resetModules();
      });

      it("Process exit should be called when no encryption key is set if the environment type is production", async () => {
        const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
          throw new Error("process.exit called");
        });

        // @ts-expect-error
        process.env.NODE_ENV = "production";
        const fetchMock = vi.fn(async () => metadata);
        const mutateMock = vi.fn(async (md: MetadataEntry[]) => [...metadata, ...md]);
        expect(
          () =>
            new EncryptedMetadataManager({
              fetchMetadata: fetchMock,
              mutateMetadata: mutateMock,
              // @ts-expect-error
              encryptionKey: undefined,
            })
        ).toThrowError("process.exit called");
        expect(mockExit).toHaveBeenCalledWith(1);
      });

      it("If env type is different than production (development/test) use placeholder value", async () => {
        const fetchMock = vi.fn(async () => metadata);
        const mutateMock = vi.fn(async (md: MetadataEntry[]) => [...metadata, ...md]);
        const manager = new EncryptedMetadataManager({
          fetchMetadata: fetchMock,
          mutateMetadata: mutateMock,
          // @ts-expect-error
          encryptionKey: undefined,
        });

        // @ts-expect-error
        expect(manager.encryptionKey).toBe("CHANGE_ME");
      });
    });

    describe("Manager operations", () => {
      const fetchMock = vi.fn(async () => metadata);
      const mutateMock = vi.fn(async (md: MetadataEntry[]) => [...metadata, ...md]);
      const manager = new EncryptedMetadataManager({
        fetchMetadata: fetchMock,
        mutateMetadata: mutateMock,
        encryptionKey: "key",
      });

      beforeEach(() => {
        vi.restoreAllMocks();
      });

      it("Set encrypted value in the metadata", async () => {
        const newEntry = { key: "new", value: "new value" };

        await manager.set(newEntry);
        const mutateValue = mutateMock.mock.lastCall![0][0].value;

        // Encrypted value should be encrypted, alphanumeric value and different than input
        expect(mutateValue).toMatch(/^[\d\w]+$/);
        expect(mutateValue).not.toEqual(newEntry.key);
        // Set method should populate cache with updated values, so fetch is never called
        expect(fetchMock).toBeCalledTimes(0);
      });

      it("Get encrypted data from metadata", async () => {
        const value = await manager.get(encryptedEntry.key);
        expect(value).toMatch("new value");
        // make sure encrypted metadata is different than decrypted value
        expect(value).not.toEqual(encryptedEntry.value);
        expect(fetchMock).toBeCalledTimes(0);
      });

      it("Use custom encryption callbacks", async () => {
        const newEntry = { key: "new", value: "new value" };

        // dummy encryption - join value and string together
        const customEncrypt: EncryptCallback = (value, secret) => value + secret;
        // dummy decryption - remove secret from end of the "encrypted" value
        const customDecrypt: DecryptCallback = (value, secret) =>
          value.substr(0, value.length - secret.length);

        const customManager = new EncryptedMetadataManager({
          fetchMetadata: fetchMock,
          mutateMetadata: mutateMock,
          encryptionKey: "key",
          encryptionMethod: customEncrypt,
          decryptionMethod: customDecrypt,
        });

        await customManager.set(newEntry);
        // value send to the API should be encrypted with custom method
        const mutateValue = mutateMock.mock.lastCall![0][0].value;
        expect(mutateValue).toMatch("new valuekey");

        // value from get should be "decrypted" using custom method
        expect(await customManager.get(newEntry.key)).toMatch("new value");
        // Set method should populate cache with updated values, so fetch is never called
        expect(fetchMock).toBeCalledTimes(0);
      });
    });
  });
});
