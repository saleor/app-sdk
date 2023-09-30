import { afterEach, describe, expect, it } from "vitest";

import { AuthData } from "./apl";
import { RedisAPL } from "./redis-apl";

// Obviously, for this test to pass you need to have a docker container running redis :)
const localRedisServerUrl = new URL("redis://127.0.0.1:6379/1");
const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
  saleorApiUrl: "https://example.com/graphql/",
  appId: "42",
  jwks: "{}",
};

describe("APL", () => {
  afterEach(async () => {
    const apl = new RedisAPL(localRedisServerUrl, stubAuthData.appId);
    await apl.delete(stubAuthData.saleorApiUrl);
  });

  describe("redisAPL", () => {
    describe("get", () => {
      it("Returns auth data for existing api url", async () => {
        const apl = new RedisAPL(localRedisServerUrl, stubAuthData.appId);
        await apl.set(stubAuthData);

        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
      });

      it("Returns undefined for unknown api url", async () => {
        const apl = new RedisAPL(localRedisServerUrl, stubAuthData.appId);

        expect(await apl.get("unknown-domain.example.com")).toBeUndefined();
      });
    });

    describe("set", () => {
      it("should save to redis and return value afterwards", async () => {
        const apl = new RedisAPL(localRedisServerUrl, stubAuthData.appId);

        await apl.set(stubAuthData);
        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
      });
    });

    describe("delete", () => {
      it("Should delete when called with known domain", async () => {
        const apl = new RedisAPL(localRedisServerUrl, stubAuthData.appId);

        await apl.delete("api.random.sk");
        expect(await apl.get(stubAuthData.saleorApiUrl)).toBeUndefined();
      });
    });
  });
});
