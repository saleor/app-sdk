import { createClient } from "redis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { RedisAPL } from "../../src/APL/redis";

// These tests require a running Redis instance
// Run with: INTEGRATION=1 pnpm test
const runIntegrationTests = process.env.INTEGRATION === "1";
const testFn = runIntegrationTests ? describe : describe.skip;

testFn("Redis APL Integration", () => {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  let apl: RedisAPL;

  beforeAll(async () => {
    await client.connect();
    apl = new RedisAPL({ client });
    // Clear any existing test data
    const allKeys = await client.hGetAll("saleor_app_auth");
    for (const key of Object.keys(allKeys)) {
      await client.hDel("saleor_app_auth", key);
    }
  });

  afterAll(async () => {
    await client.quit();
  });

  it("should successfully connect to Redis", async () => {
    const result = await client.ping();
    expect(result).toBe("PONG");
  });

  it("should store and retrieve auth data", async () => {
    const testAuthData = {
      token: "test-token",
      saleorApiUrl: "https://test-store.saleor.cloud/graphql/",
      appId: "test-app-id",
    };

    await apl.set(testAuthData);
    const retrieved = await apl.get(testAuthData.saleorApiUrl);

    expect(retrieved).toEqual(testAuthData);
  });

  it("should delete auth data", async () => {
    const testAuthData = {
      token: "test-token-2",
      saleorApiUrl: "https://test-store-2.saleor.cloud/graphql/",
      appId: "test-app-id-2",
    };

    await apl.set(testAuthData);
    await apl.delete(testAuthData.saleorApiUrl);

    const retrieved = await apl.get(testAuthData.saleorApiUrl);
    expect(retrieved).toBeUndefined();
  });

  it("should list all stored auth data", async () => {
    // Clear any existing data first
    const existingData = await apl.getAll();
    for (const data of existingData) {
      await apl.delete(data.saleorApiUrl);
    }

    const testData1 = {
      token: "test-token-1",
      saleorApiUrl: "https://test1.saleor.cloud/graphql/",
      appId: "test-app-id-1",
    };

    const testData2 = {
      token: "test-token-2",
      saleorApiUrl: "https://test2.saleor.cloud/graphql/",
      appId: "test-app-id-2",
    };

    await apl.set(testData1);
    await apl.set(testData2);

    const allData = await apl.getAll();

    expect(allData).toHaveLength(2);
    expect(allData).toEqual(expect.arrayContaining([testData1, testData2]));
  });
});
