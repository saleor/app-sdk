import { createClient } from "redis";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AuthData } from "../../src/APL";
import { RedisAPL } from "../../src/APL/redis";

// These tests require a running Redis instance
// Run with: INTEGRATION=1 pnpm test
const runIntegrationTests = process.env.INTEGRATION === "1";
const testFn = runIntegrationTests ? describe : describe.skip;

const getMockAuthData = (saleorApiUrl = "https://demo.saleor.io/graphql"): AuthData => ({
  appId: "foobar",
  saleorApiUrl,
  token: "token",
  domain: "domain",
  jwks: "{}",
});

testFn("Redis APL Integration", () => {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    await client.quit();
  });

  it("should successfully connect to Redis", async () => {
    const result = await client.ping();
    expect(result).toBe("PONG");
  });

  describe("with default collection key", () => {
    let apl: RedisAPL;
    const defaultHashKey = "saleor_app_auth"; // Default key used in RedisAPL

    beforeAll(async () => {
      apl = new RedisAPL({ client });
    });

    beforeEach(async () => {
      // Clear any existing test data
      await client.del(defaultHashKey);
    });

    afterAll(async () => {
      await client.del(defaultHashKey);
    });

    it("should store and retrieve auth data", async () => {
      const testAuthData = getMockAuthData("https://test-store.saleor.cloud/graphql/");
      await apl.set(testAuthData);
      const retrieved = await apl.get(testAuthData.saleorApiUrl);

      expect(retrieved).toEqual(testAuthData);
    });

    it("should delete auth data", async () => {
      const testAuthData = getMockAuthData("https://test-delete.saleor.cloud/graphql/");

      await apl.set(testAuthData);
      await apl.delete(testAuthData.saleorApiUrl);

      const retrieved = await apl.get(testAuthData.saleorApiUrl);
      expect(retrieved).toBeUndefined();
    });

    it("should list all stored auth data", async () => {
      const testData1 = getMockAuthData("https://test1.saleor.cloud/graphql/");

      const testData2 = getMockAuthData("https://test2.saleor.cloud/graphql/");

      await apl.set(testData1);
      await apl.set(testData2);

      const allData = await apl.getAll();

      expect(allData).toHaveLength(2);
      expect(allData).toEqual(expect.arrayContaining([testData1, testData2]));
    });

    it("it should return an empty object when collection is empty", async () => {
      await client.hSet(defaultHashKey, "dummy", "dummy"); // Create empty hash
      await client.hDel(defaultHashKey, "dummy"); // Remove dummy entry

      const allData = await apl.getAll();

      expect(allData).toEqual([]);
    });

    it("should accept malformed data like Vercel KV", async () => {
      const validData = getMockAuthData("https://test1.saleor.io/graphql");

      await apl.set(validData);

      await client.hSet(defaultHashKey, {
        "invalid-entry": JSON.stringify({ token: "only-token" }),
        "wrong-types": JSON.stringify({
          token: 123,
          saleorApiUrl: true,
          appId: ["not", "a", "string"],
        }),
      });

      const allData = await apl.getAll();

      expect(allData).toHaveLength(3);
      expect(allData).toContainEqual(validData);
      expect(allData).toContainEqual({ token: "only-token" });
      expect(allData).toContainEqual({
        token: 123,
        saleorApiUrl: true,
        appId: ["not", "a", "string"],
      });
    });
  });

  describe("with custom collection key", () => {
    let apl: RedisAPL;
    const customHashKey = "custom_test_collection";

    beforeAll(async () => {
      apl = new RedisAPL({ client, hashCollectionKey: customHashKey });
    });

    beforeEach(async () => {
      // Clear any existing test data
      await client.del(customHashKey);
    });

    afterAll(async () => {
      await client.del(customHashKey);
    });

    it("should store and retrieve auth data in custom collection", async () => {
      const testAuthData = getMockAuthData("https://custom-store.saleor.cloud/graphql/");
      await apl.set(testAuthData);

      // Verify data is stored in custom collection
      const rawData = await client.hGet(customHashKey, testAuthData.saleorApiUrl);
      expect(JSON.parse(rawData!)).toEqual(testAuthData);

      // Verify data is not in default collection
      const defaultData = await client.hGet("saleor_app_auth", testAuthData.saleorApiUrl);
      expect(defaultData).toBeNull();

      // Verify get method works
      const retrieved = await apl.get(testAuthData.saleorApiUrl);
      expect(retrieved).toEqual(testAuthData);
    });

    it("should list all stored auth data from custom collection", async () => {
      const testData1 = getMockAuthData("https://custom1.saleor.cloud/graphql/");
      const testData2 = getMockAuthData("https://custom2.saleor.cloud/graphql/");

      await apl.set(testData1);
      await apl.set(testData2);

      // Add some data to default collection to ensure it's not included
      await client.hSet("saleor_app_auth", {
        "other-url": JSON.stringify({
          token: "other-token",
          saleorApiUrl: "https://other.saleor.cloud/graphql/",
          appId: "other-app-id",
        }),
      });

      const allData = await apl.getAll();

      expect(allData).toHaveLength(2);
      expect(allData).toEqual(expect.arrayContaining([testData1, testData2]));
    });

    it("should delete auth data from custom collection only", async () => {
      const testAuthData = getMockAuthData("https://delete-test.saleor.cloud/graphql/");

      // Set same data in both collections
      await client.hSet(customHashKey, {
        [testAuthData.saleorApiUrl]: JSON.stringify(testAuthData),
      });
      await client.hSet("saleor_app_auth", {
        [testAuthData.saleorApiUrl]: JSON.stringify(testAuthData),
      });

      await apl.delete(testAuthData.saleorApiUrl);

      // Verify deleted from custom collection
      const customData = await client.hGet(customHashKey, testAuthData.saleorApiUrl);
      expect(customData).toBeNull();

      // Verify still exists in default collection
      const defaultData = await client.hGet("saleor_app_auth", testAuthData.saleorApiUrl);
      expect(JSON.parse(defaultData!)).toEqual(testAuthData);
    });

    it("it should return an empty object when collection is empty", async () => {
      await client.hSet(customHashKey, "dummy", "dummy"); // Create empty hash
      await client.hDel(customHashKey, "dummy"); // Remove dummy entry

      const allData = await apl.getAll();
      expect(allData).toEqual([]);
    });
  });
});
