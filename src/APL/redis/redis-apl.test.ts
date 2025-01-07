import { createClient } from "redis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "../apl";
import { RedisAPL } from "./redis-apl";

// Mock Redis client
const mockRedisClient = {
  connect: vi.fn().mockResolvedValue(undefined),
  ping: vi.fn().mockResolvedValue("PONG"),
  hGet: vi.fn(),
  hSet: vi.fn(),
  hDel: vi.fn(),
  hGetAll: vi.fn(),
  isOpen: false,
};

vi.mock("redis", () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

describe("RedisAPL", () => {
  const mockRedisUrl = "redis://localhost:6379";
  const mockHashKey = "test_hash_key";
  const mockAuthData: AuthData = {
    token: "test-token",
    saleorApiUrl: "https://test-store.saleor.cloud/graphql/",
    appId: "test-app-id",
  };

  let apl: RedisAPL;

  beforeEach(() => {
    process.env.REDIS_URL = mockRedisUrl;
    process.env.REDIS_HASH_KEY = mockHashKey;
    apl = new RedisAPL();
    vi.clearAllMocks();
    mockRedisClient.isOpen = false;
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
    delete process.env.REDIS_HASH_KEY;
  });

  describe("constructor", () => {
    it("throws error when Redis URL is not provided", () => {
      delete process.env.REDIS_URL;
      expect(() => new RedisAPL()).toThrow("Missing Redis configuration");
    });

    it("uses provided config over environment variables", () => {
      const customUrl = "redis://custom:6379";
      const customHashKey = "custom_hash";
      new RedisAPL({ url: customUrl, hashCollectionKey: customHashKey });
      expect(createClient).toHaveBeenCalledWith({ url: customUrl });
    });
  });

  describe("get", () => {
    it("returns undefined when no data found", async () => {
      mockRedisClient.hGet.mockResolvedValueOnce(null);
      const result = await apl.get(mockAuthData.saleorApiUrl);
      expect(result).toBeUndefined();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it("returns parsed auth data when found", async () => {
      mockRedisClient.hGet.mockResolvedValueOnce(JSON.stringify(mockAuthData));
      const result = await apl.get(mockAuthData.saleorApiUrl);
      expect(result).toEqual(mockAuthData);
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(mockHashKey, mockAuthData.saleorApiUrl);
    });

    it("throws error when Redis operation fails", async () => {
      mockRedisClient.hGet.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.get(mockAuthData.saleorApiUrl)).rejects.toThrow("Redis error");
    });
  });

  describe("set", () => {
    it("successfully sets auth data", async () => {
      mockRedisClient.hSet.mockResolvedValueOnce(1);
      await apl.set(mockAuthData);
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        mockHashKey,
        mockAuthData.saleorApiUrl,
        JSON.stringify(mockAuthData)
      );
    });

    it("throws error when Redis operation fails", async () => {
      mockRedisClient.hSet.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.set(mockAuthData)).rejects.toThrow("Redis error");
    });
  });

  describe("delete", () => {
    it("successfully deletes auth data", async () => {
      mockRedisClient.hDel.mockResolvedValueOnce(1);
      await apl.delete(mockAuthData.saleorApiUrl);
      expect(mockRedisClient.hDel).toHaveBeenCalledWith(mockHashKey, mockAuthData.saleorApiUrl);
    });

    it("throws error when Redis operation fails", async () => {
      mockRedisClient.hDel.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.delete(mockAuthData.saleorApiUrl)).rejects.toThrow("Redis error");
    });
  });

  describe("getAll", () => {
    it("returns all auth data", async () => {
      const mockAllData = {
        [mockAuthData.saleorApiUrl]: JSON.stringify(mockAuthData),
      };
      mockRedisClient.hGetAll.mockResolvedValueOnce(mockAllData);
      const result = await apl.getAll();
      expect(result).toEqual([mockAuthData]);
    });

    it("throws error when Redis operation fails", async () => {
      mockRedisClient.hGetAll.mockRejectedValueOnce(new Error("Redis error"));
      await expect(apl.getAll()).rejects.toThrow("Redis error");
    });
  });

  describe("isReady", () => {
    it("returns ready true when Redis is connected", async () => {
      mockRedisClient.ping.mockResolvedValueOnce("PONG");
      const result = await apl.isReady();
      expect(result).toEqual({ ready: true });
    });

    it("returns ready false with error when Redis is not connected", async () => {
      mockRedisClient.ping.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await apl.isReady();
      expect(result).toEqual({ ready: false, error: new Error("Connection failed") });
    });
  });

  describe("isConfigured", () => {
    it("returns configured true when Redis is connected", async () => {
      mockRedisClient.ping.mockResolvedValueOnce("PONG");
      const result = await apl.isConfigured();
      expect(result).toEqual({ configured: true });
    });

    it("returns configured false with error when Redis is not connected", async () => {
      mockRedisClient.ping.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await apl.isConfigured();
      expect(result).toEqual({ configured: false, error: new Error("Connection failed") });
    });
  });
});
