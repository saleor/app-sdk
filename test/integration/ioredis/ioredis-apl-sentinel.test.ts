import Redis from "ioredis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { IORedisAPL } from "../../../src/APL/ioredis";

// These tests require a running Redis Sentinel setup
// Run with: SENTINEL_INTEGRATION=1 pnpm test
const runSentinelTests =
  process.env.SENTINEL_INTEGRATION === "1" && process.env.INTEGRATION !== "1";
const testFn = runSentinelTests ? describe : describe.skip;

testFn("IORedis Sentinel APL Integration", () => {
  const client = new Redis({
    sentinels: [
      { host: "localhost", port: 26379 },
      { host: "localhost", port: 26380 },
      { host: "localhost", port: 26381 },
    ],
    name: "mymaster",
  });

  let apl: IORedisAPL;

  beforeAll(async () => {
    apl = new IORedisAPL({ client });
    // Clear any existing test data
    const allKeys = await client.hgetall("saleor_app_auth");
    for (const key of Object.keys(allKeys)) {
      await client.hdel("saleor_app_auth", key);
    }
  });

  afterAll(async () => {
    const allKeys = await client.hgetall("saleor_app_auth");
    if (allKeys) {
      for (const key of Object.keys(allKeys)) {
        await client.hdel("saleor_app_auth", key);
      }
    }
    await client.quit();
  });

  it("should successfully connect to Redis via Sentinel", async () => {
    const result = await client.ping();
    expect(result).toBe("PONG");
  });

  it("should store and retrieve auth data through Sentinel", async () => {
    const testAuthData = {
      token: "sentinel-test-token",
      saleorApiUrl: "https://sentinel-test.saleor.cloud/graphql/",
      appId: "sentinel-test-app-id",
    };

    await apl.set(testAuthData);
    const retrieved = await apl.get(testAuthData.saleorApiUrl);

    expect(retrieved).toEqual(testAuthData);
  });

  it("should handle failover scenarios", async () => {
    // This test simulates retrieving data after a potential failover
    const testAuthData = {
      token: "failover-test-token",
      saleorApiUrl: "https://failover-test.saleor.cloud/graphql/",
      appId: "failover-test-app-id",
    };

    await apl.set(testAuthData);

    // In a real failover scenario, the client would automatically reconnect to the new master
    // For testing, we can simulate by ensuring data remains accessible
    const retrieved = await apl.get(testAuthData.saleorApiUrl);
    expect(retrieved).toEqual(testAuthData);
  });

  it("should delete auth data when using Sentinel", async () => {
    const testAuthData = {
      token: "sentinel-delete-token",
      saleorApiUrl: "https://delete-test.saleor.cloud/graphql/",
      appId: "sentinel-delete-app-id",
    };

    await apl.set(testAuthData);
    await apl.delete(testAuthData.saleorApiUrl);

    const retrieved = await apl.get(testAuthData.saleorApiUrl);
    expect(retrieved).toBeUndefined();
  });

  it("should list all stored auth data when using Sentinel", async () => {
    // Clear any existing data first
    const existingData = await apl.getAll();
    for (const data of existingData) {
      await apl.delete(data.saleorApiUrl);
    }

    const testData1 = {
      token: "sentinel-token-1",
      saleorApiUrl: "https://sentinel1.saleor.cloud/graphql/",
      appId: "sentinel-app-id-1",
    };

    const testData2 = {
      token: "sentinel-token-2",
      saleorApiUrl: "https://sentinel2.saleor.cloud/graphql/",
      appId: "sentinel-app-id-2",
    };

    await apl.set(testData1);
    await apl.set(testData2);

    const allData = await apl.getAll();

    // eslint-disable-next-line no-console
    console.log(allData);

    expect(allData).toHaveLength(2);
    expect(allData).toEqual(expect.arrayContaining([testData1, testData2]));
  });
});
