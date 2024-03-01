import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "./apl";
import { UpstashAPL, UpstashAPLConfig, UpstashAPLVariables } from "./upstash-apl";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const aplConfig: UpstashAPLConfig = {
  restToken: "token",
  restURL: "http://example.com",
};

const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
  saleorApiUrl: "https://example.com/graphql/",
  appId: "42",
  jwks: "{}",
};

describe("APL", () => {
  const initialEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...initialEnv };
    vi.resetModules();
  });

  describe("UpstashAPL", () => {
    it("Test if constructor use options over environment variables", async () => {
      process.env[UpstashAPLVariables.UPSTASH_TOKEN] = "environment";
      process.env[UpstashAPLVariables.UPSTASH_URL] = "environment";

      const apl = await new UpstashAPL({ restToken: "option", restURL: "option" });
      // @ts-expect-error - testing private properties
      expect(apl.restToken).toBe("option");
      // @ts-expect-error - testing private properties
      expect(apl.restURL).toBe("option");
    });

    describe("set", () => {
      it("Successful save of the auth data", async () => {
        // @ts-ignore Ignore type of mocked response
        fetchMock.mockResolvedValue({
          status: 200,
          ok: true,
          json: async () => ({ result: "ok" }),
        });
        const apl = new UpstashAPL({
          restURL: "https://example.com",
          restToken: "token",
        });
        await apl.set(stubAuthData);
        expect(fetchMock).toBeCalledWith(
          "https://example.com",

          {
            body: JSON.stringify(["SET", stubAuthData.saleorApiUrl, JSON.stringify(stubAuthData)]),
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer token",
            },
            method: "POST",
          }
        );
      });

      it("Raise error when register service returns non 200 response", async () => {
        // @ts-ignore Ignore type of mocked response
        fetchMock.mockResolvedValue({
          status: 401,
          ok: false,
          json: async () => ({ error: "Unauthorized" }),
        });

        const apl = new UpstashAPL({
          restURL: "https://example.com",
          restToken: "token",
        });
        await expect(apl.set(stubAuthData)).rejects.toThrow(
          "Upstash APL was not able to perform operation. Status code: 401. Error: Unauthorized"
        );
      });
    });

    describe("get", () => {
      describe("Read existing auth data from upstash", () => {
        it("Read existing auth data", async () => {
          // @ts-ignore Ignore type of mocked response
          fetchMock.mockResolvedValue({
            status: 200,
            ok: true,
            json: async () => ({
              result: JSON.stringify(stubAuthData),
            }),
          });
          const apl = new UpstashAPL(aplConfig);

          expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
        });

        it("Return undefined when unknown domain requested", async () => {
          // @ts-ignore Ignore type of mocked response
          fetchMock.mockResolvedValue({
            status: 200,
            ok: true,
            json: async () => ({
              result: null,
            }),
          });
          const apl = new UpstashAPL(aplConfig);

          expect(await apl.get("unknown-domain.example.com")).toBe(undefined);
        });
      });
    });

    describe("getAll", () => {
      describe("Check if error is raised", () => {
        it("Read existing auth data", async () => {
          const apl = new UpstashAPL(aplConfig);
          await expect(apl.getAll()).rejects.toThrow("UpstashAPL does not support getAll method");
        });
      });
    });

    describe("isReady", () => {
      it("Returns error with message mentioning missing configuration variables", async () => {
        // Delete upstash variables if are already present in the env
        delete process.env[UpstashAPLVariables.UPSTASH_TOKEN];
        delete process.env[UpstashAPLVariables.UPSTASH_URL];

        const apl = new UpstashAPL();

        const result = await apl.isReady();
        expect(result.ready).toBeFalsy();
        // @ts-ignore
        expect(result.error.message).toEqual(
          // eslint-disable-next-line quotes
          'Configuration values for: "restToken", "restURL" not found or is empty. Pass values to constructor of use env variables.'
        );
      });
    });
  });
});
