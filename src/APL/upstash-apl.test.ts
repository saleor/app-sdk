import fetch from "node-fetch";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "./apl";
import { UpstashAPL, UpstashAPLConfig, UpstashAPLVariables } from "./upstash-apl";

vi.mock("node-fetch", () => ({
  default: vi.fn().mockImplementation(() => ""),
}));

const mockFetch = vi.mocked(fetch);

const aplConfig: UpstashAPLConfig = {
  restToken: "token",
  restURL: "http://example.com",
};

const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
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
      // eslint-disable-next-line dot-notation
      expect(apl["restToken"]).toBe("option");
      // eslint-disable-next-line dot-notation
      expect(apl["restURL"]).toBe("option");
    });

    describe("set", () => {
      it("Successful save of the auth data", async () => {
        // @ts-ignore Ignore type of mocked response
        mockFetch.mockResolvedValue({
          status: 200,
          json: async () => ({ result: "ok" }),
        });
        const apl = new UpstashAPL({
          restURL: "https://example.com",
          restToken: "token",
        });
        await apl.set({ domain: "example.com", token: "token" });
        expect(mockFetch).toBeCalledWith(
          "https://example.com",

          {
            // eslint-disable-next-line quotes
            body: '["SET", "example.com", "token"]',
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
        mockFetch.mockResolvedValue({ status: 500 });

        const apl = new UpstashAPL({
          restURL: "https://example.com",
          restToken: "token",
        });
        await expect(apl.set({ domain: "example.com", token: "token" })).rejects.toThrow(
          "Upstash APL responded with the code 500"
        );
      });
    });

    describe("get", () => {
      describe("Read existing auth data from env", () => {
        it("Read existing auth data", async () => {
          // @ts-ignore Ignore type of mocked response
          mockFetch.mockResolvedValue({
            status: 200,
            json: async () => ({
              result: stubAuthData.token,
            }),
          });
          const apl = new UpstashAPL(aplConfig);

          expect(await apl.get(stubAuthData.domain)).toStrictEqual(stubAuthData);
        });

        it("Return undefined when unknown domain requested", async () => {
          // @ts-ignore Ignore type of mocked response
          mockFetch.mockResolvedValue({
            status: 200,
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
