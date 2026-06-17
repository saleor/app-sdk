import { kv, VercelKV } from "@vercel/kv";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { AuthData } from "../apl";
import { VercelKvApl } from "./vercel-kv-apl";

vi.mock("@vercel/kv", () => {
  /**
   * Client uses only hash methods
   */
  const mockKv: Pick<VercelKV, "hget" | "hset" | "hdel" | "hgetall"> = {
    hget: vi.fn(),
    hset: vi.fn(),
    hdel: vi.fn(),
    hgetall: vi.fn(),
  };

  return { kv: mockKv };
});

const getMockAuthData = (saleorApiUrl = "https://demo.saleor.io/graphql"): AuthData => ({
  appId: "foobar",
  saleorApiUrl,
  token: "token",
  jwks: "{}",
});

const APP_NAME_NAMESPACE = "test-app";

describe("VercelKvApl", () => {
  beforeEach(() => {
    vi.stubEnv("KV_URL", "https://url.vercel.io");
    vi.stubEnv("KV_REST_API_URL", "https://url.vercel.io");
    vi.stubEnv("KV_REST_API_TOKEN", "test-token");
    vi.stubEnv("KV_REST_API_READ_ONLY_TOKEN", "test-read-token");
    vi.stubEnv("KV_STORAGE_NAMESPACE", APP_NAME_NAMESPACE);
  });

  it("Constructs", () => {
    expect(new VercelKvApl()).toBeDefined();
  });

  it("Fails if envs are missing", () => {
    vi.unstubAllEnvs();

    expect(() => new VercelKvApl()).toThrow();
  });

  it("Allows overriding the hash collection key via constructor options", async () => {
    const apl = new VercelKvApl({ hashCollectionKey: "custom-namespace" });

    await apl.set(getMockAuthData());

    expect(kv.hset).toHaveBeenCalledWith("custom-namespace", {
      "https://demo.saleor.io/graphql": getMockAuthData(),
    });
  });

  describe("get", () => {
    it("returns parsed auth data", async () => {
      (kv.hget as Mock).mockImplementationOnce(async () => getMockAuthData());

      const apl = new VercelKvApl();

      const authData = await apl.get("https://demo.saleor.io/graphql");

      expect(authData).toEqual(getMockAuthData());
    });

    it("returns undefined when no auth data is stored", async () => {
      (kv.hget as Mock).mockResolvedValueOnce(null);

      const apl = new VercelKvApl();

      await expect(apl.get("https://demo.saleor.io/graphql")).resolves.toBeUndefined();
    });

    it("rethrows when the KV client fails", async () => {
      (kv.hget as Mock).mockRejectedValueOnce(new Error("KV down"));

      const apl = new VercelKvApl();

      await expect(apl.get("https://demo.saleor.io/graphql")).rejects.toThrow("KV down");
    });
  });

  describe("set", () => {
    it("Sets auth data under a namespace provided in env", async () => {
      const apl = new VercelKvApl();

      await apl.set(getMockAuthData());

      expect(kv.hset).toHaveBeenCalledWith(APP_NAME_NAMESPACE, {
        "https://demo.saleor.io/graphql": getMockAuthData(),
      });
    });

    it("rethrows when the KV client fails", async () => {
      (kv.hset as Mock).mockRejectedValueOnce(new Error("KV down"));

      const apl = new VercelKvApl();

      await expect(apl.set(getMockAuthData())).rejects.toThrow("KV down");
    });
  });

  describe("delete", () => {
    it("removes the entry for the given saleorApiUrl", async () => {
      const apl = new VercelKvApl();

      await apl.delete("https://demo.saleor.io/graphql");

      expect(kv.hdel).toHaveBeenCalledWith(APP_NAME_NAMESPACE, "https://demo.saleor.io/graphql");
    });

    it("rethrows when the KV client fails", async () => {
      (kv.hdel as Mock).mockRejectedValueOnce(new Error("KV down"));

      const apl = new VercelKvApl();

      await expect(apl.delete("https://demo.saleor.io/graphql")).rejects.toThrow("KV down");
    });
  });

  describe("getAll", () => {
    it("returns all stored auth data as an array", async () => {
      (kv.hgetall as Mock).mockResolvedValueOnce({
        "https://demo.saleor.io/graphql": getMockAuthData(),
      });

      const apl = new VercelKvApl();

      await expect(apl.getAll()).resolves.toEqual([getMockAuthData()]);
    });

    it("throws when the collection was never written", async () => {
      (kv.hgetall as Mock).mockResolvedValueOnce(null);

      const apl = new VercelKvApl();

      await expect(apl.getAll()).rejects.toThrow("Missing KV collection, data was never written");
    });
  });

  describe("isReady / isConfigured", () => {
    it("reports ready and configured when env variables are set", async () => {
      const apl = new VercelKvApl();

      await expect(apl.isReady()).resolves.toEqual({ ready: true });
      await expect(apl.isConfigured()).resolves.toEqual({ configured: true });
    });

    it("reports not ready and not configured when env variables are missing", async () => {
      const apl = new VercelKvApl();
      vi.unstubAllEnvs();

      await expect(apl.isReady()).resolves.toEqual({
        ready: false,
        error: expect.any(Error),
      });
      await expect(apl.isConfigured()).resolves.toEqual({
        configured: false,
        error: expect.any(Error),
      });
    });
  });

  describe("updatedAt handling", () => {
    const updatedAt = new Date("2024-06-15T10:20:30.456Z");

    it("set serializes updatedAt as ISO string when JSON-serialized", async () => {
      (kv.hset as Mock).mockClear();
      const apl = new VercelKvApl();

      await apl.set({ ...getMockAuthData(), updatedAt });

      // @vercel/kv stringifies values internally; verify the underlying serialization
      // produces an ISO string for updatedAt.
      const passedRecord = (kv.hset as Mock).mock.calls.at(-1)![1] as Record<string, unknown>;
      const serialized = JSON.parse(JSON.stringify(passedRecord)) as Record<
        string,
        { updatedAt: string }
      >;
      expect(serialized["https://demo.saleor.io/graphql"]!.updatedAt).toBe(
        updatedAt.toISOString(),
      );
    });

    it("get restores updatedAt as Date with the same UTC instant", async () => {
      (kv.hget as Mock).mockImplementationOnce(async () => ({
        ...getMockAuthData(),
        updatedAt: updatedAt.toISOString(),
      }));

      const apl = new VercelKvApl();
      const result = await apl.get("https://demo.saleor.io/graphql");

      expect(result?.updatedAt).toBeInstanceOf(Date);
      expect(result?.updatedAt?.toISOString()).toBe(updatedAt.toISOString());
      expect(result?.updatedAt?.getTime()).toBe(updatedAt.getTime());
    });

    it("get does not throw and returns no updatedAt when missing in persistence", async () => {
      (kv.hget as Mock).mockImplementationOnce(async () => getMockAuthData());

      const apl = new VercelKvApl();
      const result = await apl.get("https://demo.saleor.io/graphql");

      expect(result).toBeDefined();
      expect(result?.updatedAt).toBeUndefined();
    });

    it("getAll restores updatedAt as Date for stored entries", async () => {
      (kv.hgetall as Mock).mockResolvedValueOnce({
        "https://demo.saleor.io/graphql": {
          ...getMockAuthData(),
          updatedAt: updatedAt.toISOString(),
        },
      });

      const apl = new VercelKvApl();
      const [result] = await apl.getAll();

      expect(result?.updatedAt).toBeInstanceOf(Date);
      expect(result?.updatedAt?.toISOString()).toBe(updatedAt.toISOString());
    });

    it("getAll does not throw when updatedAt is missing in persistence", async () => {
      (kv.hgetall as Mock).mockResolvedValueOnce({
        "https://demo.saleor.io/graphql": getMockAuthData(),
      });

      const apl = new VercelKvApl();
      const result = await apl.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]?.updatedAt).toBeUndefined();
    });
  });
});
