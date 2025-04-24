import Redis from "ioredis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "../apl";
import { IORedisAPL } from "./ioredis-apl";

let isRedisConnected = false;

const mockHGet = vi.fn().mockResolvedValue(undefined);
const mockHSet = vi.fn().mockResolvedValue(1);
const mockHDel = vi.fn().mockResolvedValue(1);
const mockHGetAll = vi.fn().mockResolvedValue({});
const mockPing = vi.fn().mockResolvedValue("PONG");
const mockConnect = vi.fn().mockImplementation(async () => {
  isRedisConnected = true;
});
const mockDisconnect = vi.fn().mockImplementation(async () => {
  isRedisConnected = false;
});

const mockRedisClient = {
  connect: mockConnect,
  ping: mockPing,
  hget: mockHGet,
  hset: mockHSet,
  hdel: mockHDel,
  hgetall: mockHGetAll,
  status: "wait" as "wait" | "ready" | "end",
  disconnect: mockDisconnect,
} as unknown as Redis;

vi.mock("ioredis", () => ({
  default: vi.fn(() => mockRedisClient),
}));

describe("IORedisAPL", () => {
  const mockHashKey = "test_hash_key";
  const mockAuthData: AuthData = {
    token: "test-token",
    saleorApiUrl: "https://test-store.saleor.cloud/graphql/",
    appId: "test-app-id",
  };

  let apl: IORedisAPL;

  beforeEach(() => {
    apl = new IORedisAPL({
      client: mockRedisClient,
      hashCollectionKey: mockHashKey,
    });

    vi.clearAllMocks();
    isRedisConnected = false;
    mockRedisClient.status = "wait";
  });

  afterEach(async () => {
    if (isRedisConnected) {
      mockRedisClient.disconnect();
    }
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("uses provided hash key", async () => {
      const customHashKey = "custom_hash";
      const customApl = new IORedisAPL({
        client: mockRedisClient,
        hashCollectionKey: customHashKey,
      });

      await customApl.get(mockAuthData.saleorApiUrl);
      expect(mockRedisClient.hget).toHaveBeenCalledWith(customHashKey, mockAuthData.saleorApiUrl);
    });

    it("uses default hash key when not provided", async () => {
      const defaultApl = new IORedisAPL({
        client: mockRedisClient,
      });

      await defaultApl.get(mockAuthData.saleorApiUrl);
      expect(mockRedisClient.hget).toHaveBeenCalledWith(
        "saleor_app_auth",
        mockAuthData.saleorApiUrl,
      );
    });
  });

  describe("get", () => {
    it("returns undefined when no data found", async () => {
      mockHGet.mockResolvedValueOnce(null);
      const result = await apl.get(mockAuthData.saleorApiUrl);
      expect(result).toBeUndefined();
      expect(mockConnect).toHaveBeenCalled();
    });

    it("returns parsed auth data when found", async () => {
      mockHGet.mockResolvedValueOnce(JSON.stringify(mockAuthData));
      const result = await apl.get(mockAuthData.saleorApiUrl);
      expect(result).toEqual(mockAuthData);
      expect(mockHGet).toHaveBeenCalledWith(mockHashKey, mockAuthData.saleorApiUrl);
    });

    it("throws error when Redis operation fails", async () => {
      mockHGet.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.get(mockAuthData.saleorApiUrl)).rejects.toThrow("Redis error");
    });

    it("connects to Redis if not connected", async () => {
      mockRedisClient.status = "wait";
      await apl.get(mockAuthData.saleorApiUrl);
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe("set", () => {
    it("successfully sets auth data", async () => {
      mockHSet.mockResolvedValueOnce(1);
      await apl.set(mockAuthData);
      expect(mockHSet).toHaveBeenCalledWith(
        mockHashKey,
        mockAuthData.saleorApiUrl,
        JSON.stringify(mockAuthData),
      );
    });

    it("throws error when Redis operation fails", async () => {
      mockHSet.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.set(mockAuthData)).rejects.toThrow("Redis error");
    });
  });

  describe("delete", () => {
    it("successfully deletes auth data", async () => {
      mockHDel.mockResolvedValueOnce(1);
      await apl.delete(mockAuthData.saleorApiUrl);
      expect(mockHDel).toHaveBeenCalledWith(mockHashKey, mockAuthData.saleorApiUrl);
    });

    it("throws error when Redis operation fails", async () => {
      mockHDel.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.delete(mockAuthData.saleorApiUrl)).rejects.toThrow("Redis error");
    });
  });

  describe("getAll", () => {
    it("returns all auth data", async () => {
      const mockAllData = {
        [mockAuthData.saleorApiUrl]: JSON.stringify(mockAuthData),
      };
      mockHGetAll.mockResolvedValueOnce(mockAllData);
      const result = await apl.getAll();
      expect(result).toEqual([mockAuthData]);
    });

    it("throws error when Redis operation fails", async () => {
      mockHGetAll.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.getAll()).rejects.toThrow("Redis error");
    });
  });

  describe("isReady", () => {
    it("returns ready true when Redis is connected", async () => {
      mockRedisClient.status = "ready";
      mockPing.mockResolvedValueOnce("PONG");
      const result = await apl.isReady();
      expect(result).toEqual({ ready: true });
    });

    it("returns ready false with error when Redis is not connected", async () => {
      mockPing.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await apl.isReady();
      expect(result).toEqual({ ready: false, error: new Error("Connection failed") });
    });
  });

  describe("isConfigured", () => {
    it("returns configured true when Redis is connected", async () => {
      mockPing.mockResolvedValueOnce("PONG");
      const result = await apl.isConfigured();
      expect(result).toEqual({ configured: true });
    });

    it("returns configured false with error when Redis is not connected", async () => {
      mockPing.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await apl.isConfigured();
      expect(result).toEqual({ configured: false, error: new Error("Connection failed") });
    });
  });

  /**
   * Type compatibility test with real IORedis client
   */
  describe("IORedisAPL type compatibility", () => {
    it("should accept IORedis client type", () => {
      const client = new Redis();
      // This test is just for TypeScript to verify the types
      expect(() => new IORedisAPL({ client, hashCollectionKey: "test" })).not.toThrow();
    });
  });
});
