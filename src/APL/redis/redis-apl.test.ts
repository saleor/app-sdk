import { RedisClientType } from "redis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "../apl";
import { RedisAPL } from "./redis-apl";

// Create a variable to control the connection state
let isRedisOpen = false;

// Create properly typed mock functions
const mockHGet = vi.fn().mockResolvedValue(undefined);
const mockHSet = vi.fn().mockResolvedValue(1);
const mockHDel = vi.fn().mockResolvedValue(1);
const mockHGetAll = vi.fn().mockResolvedValue({});
const mockPing = vi.fn().mockResolvedValue("PONG");
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockDisconnect = vi.fn().mockResolvedValue(undefined);

const mockRedisClient = {
  connect: mockConnect,
  ping: mockPing,
  hGet: mockHGet,
  hSet: mockHSet,
  hDel: mockHDel,
  hGetAll: mockHGetAll,
  get isOpen() {
    return isRedisOpen;
  },
  disconnect: mockDisconnect,
  isReady: false,
  commandOptions: vi.fn(),
  options: {},
  duplicate: vi.fn(),
  multi: vi.fn(),
  isPubSubActive: false,
  quit: vi.fn().mockResolvedValue(undefined),
  sendCommand: vi.fn(),
  executeIsolated: vi.fn(),
} as unknown as RedisClientType;

vi.mock("redis", () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

describe("RedisAPL", () => {
  const mockHashKey = "test_hash_key";
  const mockAuthData: AuthData = {
    token: "test-token",
    saleorApiUrl: "https://test-store.saleor.cloud/graphql/",
    appId: "test-app-id",
  };

  let apl: RedisAPL;

  beforeEach(() => {
    process.env.REDIS_HASH_KEY = mockHashKey;
    apl = new RedisAPL({ client: mockRedisClient });
    vi.clearAllMocks();
    isRedisOpen = false;
  });

  afterEach(async () => {
    delete process.env.REDIS_HASH_KEY;
    if (mockRedisClient.isOpen) {
      await mockRedisClient.disconnect();
    }
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("uses provided hash key over environment variable", async () => {
      const customHashKey = "custom_hash";
      const customApl = new RedisAPL({
        client: mockRedisClient,
        hashCollectionKey: customHashKey,
      });

      // Test the hash key by making a call that uses it
      await customApl.get(mockAuthData.saleorApiUrl);
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(customHashKey, mockAuthData.saleorApiUrl);
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
  });

  describe("set", () => {
    it("successfully sets auth data", async () => {
      mockHSet.mockResolvedValueOnce(1);
      await apl.set(mockAuthData);
      expect(mockHSet).toHaveBeenCalledWith(
        mockHashKey,
        mockAuthData.saleorApiUrl,
        JSON.stringify(mockAuthData)
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
});
