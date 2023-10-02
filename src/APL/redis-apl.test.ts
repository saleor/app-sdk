import { afterEach, describe, expect, it } from "vitest";
import Redis from "ioredis-mock"

import { AuthData } from "./apl";
import { RedisAPL } from "./redis-apl";

const appApiBaseUrl = "https://localhost:4321/"
const redisClient = new Redis()
const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
  saleorApiUrl: "https://example.com/graphql/",
  appId: "42",
  jwks: "{}",
};

describe("APL", () => {
  afterEach(async () => {
    const apl = new RedisAPL({ client: redisClient, appApiBaseUrl: appApiBaseUrl });
    await apl.delete(stubAuthData.saleorApiUrl);
  });

  describe("redisAPL", () => {
    describe("get", () => {
      it("Returns auth data for existing api url", async () => {
        const apl = new RedisAPL({ client: redisClient, appApiBaseUrl: appApiBaseUrl });
        await apl.set(stubAuthData);
        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
      });

      it("Returns undefined for unknown api url", async () => {
        const apl = new RedisAPL({ client: redisClient, appApiBaseUrl: appApiBaseUrl });

        expect(await apl.get("unknown-domain.example.com")).toBeUndefined();
      });
    });

    describe("set", () => {
      it("should save to redis and return value afterwards", async () => {
        const apl = new RedisAPL({ client: redisClient, appApiBaseUrl: appApiBaseUrl });

        await apl.set(stubAuthData);
        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
      });
    });

    describe("delete", () => {
      it("Should delete when called with known domain", async () => {
        const apl = new RedisAPL({ client: redisClient, appApiBaseUrl: appApiBaseUrl });

        await apl.delete(stubAuthData.saleorApiUrl);
        expect(await apl.get(stubAuthData.saleorApiUrl)).toBeUndefined();
      });
      it("Should not delete when called with different domain", async () => {
        const apl = new RedisAPL({ client: redisClient, appApiBaseUrl: appApiBaseUrl });
        const otherAppApiBaseUrl = "https://localhost:4322/"
        const apl2 = new RedisAPL({ client: redisClient, appApiBaseUrl: otherAppApiBaseUrl });

        const otherStubAuthData: AuthData = {
          saleorApiUrl: "https://example.com/graphql",
          token: "Another token",
          domain: "example.net",
          jwks: "{}",
          appId: "22"
        }

        await apl.set(stubAuthData)
        await apl2.set(otherStubAuthData)

        /* good for debugging if something breaks :)
        await redisClient.keys("*", (err, keys) => {
          if (err) return console.log(err)
          if (keys) {
            keys.map(async (key) => {
              let val = await redisClient.get(key)
              console.log(`${key}:${val}`)
            })
          }
        })
        */
        expect(stubAuthData != otherStubAuthData).toBeTruthy()
        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
        expect(await apl2.get(otherStubAuthData.saleorApiUrl)).toStrictEqual(otherStubAuthData);
        await apl.delete(stubAuthData.saleorApiUrl);
        expect(await apl.get(stubAuthData.saleorApiUrl)).toBeUndefined();
        expect(await apl2.get(otherStubAuthData.saleorApiUrl)).toStrictEqual(otherStubAuthData);
        await apl2.delete(otherStubAuthData.saleorApiUrl);
        expect(await apl.get(stubAuthData.saleorApiUrl)).toBeUndefined();
        expect(await apl2.get(otherStubAuthData.saleorApiUrl)).toBeUndefined();
      });
    });
  });
});
