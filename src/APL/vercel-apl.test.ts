import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "./apl";
import { VercelAPL, VercelAPLVariables } from "./vercel-apl";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

// now you can access it as `IntersectionObserver` or `window.IntersectionObserver`
const aplConfig = {
  deploymentToken: "token",
  registerAppURL: "http://example.com",
};

const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
  apiUrl: "https://example.com/graphql/",
  appId: "42",
  jwks: "{}",
};

describe("APL", () => {
  const initialEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...initialEnv };
    vi.resetModules();
  });

  describe("VercelAPL", () => {
    it("Constructs VercelAPL instance when deploymentToken and registerAppURL provided", async () => {
      expect(() => new VercelAPL(aplConfig)).not.toThrow();
    });

    it("Constructs VercelAPL instance with config values from environment variables", async () => {
      process.env[VercelAPLVariables.SALEOR_REGISTER_APP_URL] = aplConfig.registerAppURL;
      process.env[VercelAPLVariables.SALEOR_DEPLOYMENT_TOKEN] = aplConfig.deploymentToken;

      expect(() => new VercelAPL()).not.toThrow();
    });

    it("Test if constructor use options over environment variables", async () => {
      process.env[VercelAPLVariables.SALEOR_REGISTER_APP_URL] = "environment";
      process.env[VercelAPLVariables.SALEOR_DEPLOYMENT_TOKEN] = "environment";

      const apl = await new VercelAPL({ deploymentToken: "option", registerAppURL: "option" });
      // eslint-disable-next-line dot-notation
      expect(apl["deploymentToken"]).toBe("option");
      // eslint-disable-next-line dot-notation
      expect(apl["registerAppURL"]).toBe("option");
    });

    describe("set", () => {
      it("Successful save of the auth data", async () => {
        // @ts-ignore Ignore type of mocked response
        fetchMock.mockResolvedValue({ status: 200 });
        const apl = new VercelAPL({
          registerAppURL: "https://registerService.example.com",
          deploymentToken: "token",
        });
        await apl.set(stubAuthData);
        expect(fetchMock).toBeCalledWith(
          "https://registerService.example.com",

          {
            body: JSON.stringify({
              token: "token",
              envs: [
                {
                  key: VercelAPLVariables.AUTH_DATA_VARIABLE_NAME,
                  value: JSON.stringify(stubAuthData),
                },
              ],
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        );
      });

      it("Successful save of the auth data during reinstallation for the same domain", async () => {
        process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME] = "old_token";
        process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME] = "example.com";

        // @ts-ignore Ignore type of mocked response
        mockFetch.mockResolvedValue({ status: 200 });
        const apl = new VercelAPL({
          registerAppURL: "https://registerService.example.com",
          deploymentToken: "token",
        });
        await apl.set({ domain: "example.com", token: "token" });
        expect(mockFetch).toBeCalledWith(
          "https://registerService.example.com",

          {
            body: JSON.stringify({
              token: "token",
              envs: [
                { key: "SALEOR_AUTH_TOKEN", value: "token" },
                { key: "SALEOR_DOMAIN", value: "example.com" },
              ],
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        );
      });

      it("Reject save of the auth data during reinstallation for a different domain", async () => {
        process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME] = "old_token";
        process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME] = "not.example.com";

        // @ts-ignore Ignore type of mocked response
        mockFetch.mockResolvedValue({ status: 200 });
        const apl = new VercelAPL({
          registerAppURL: "https://registerService.example.com",
          deploymentToken: "token",
        });
        await expect(apl.set({ domain: "example.com", token: "token" })).rejects.toThrow(
          "Vercel APL was not able to save auth data, application already registered"
        );
      });

      it("Raise error when register service returns non 200 response", async () => {
        // @ts-ignore Ignore type of mocked response
        fetchMock.mockResolvedValue({ status: 500 });

        const apl = new VercelAPL({
          registerAppURL: "https://registerService.example.com/internalError",
          deploymentToken: "token",
        });
        await expect(apl.set(stubAuthData)).rejects.toThrow(
          "Vercel APL was not able to save auth data, register service responded with the code 500"
        );
      });
    });

    describe("get", () => {
      describe("Read existing auth data from env", () => {
        it("Read existing auth data", async () => {
          process.env[VercelAPLVariables.AUTH_DATA_VARIABLE_NAME] = JSON.stringify(stubAuthData);

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get(stubAuthData.apiUrl)).toStrictEqual(stubAuthData);
        });

        it("Return undefined when unknown api url requested", async () => {
          process.env[VercelAPLVariables.AUTH_DATA_VARIABLE_NAME] = JSON.stringify(stubAuthData);

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get("https://unknown-domain.example.com/graphql/")).toBe(undefined);
        });

        it("Return undefined when no data is defined", async () => {
          delete process.env[VercelAPLVariables.AUTH_DATA_VARIABLE_NAME];

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get("https://example.com/graphql/")).toBe(undefined);
        });
      });
    });

    describe("getAll", () => {
      describe("Read existing auth data from env", () => {
        it("Read existing auth data", async () => {
          process.env[VercelAPLVariables.AUTH_DATA_VARIABLE_NAME] = JSON.stringify(stubAuthData);

          const apl = new VercelAPL(aplConfig);

          expect(await apl.getAll()).toStrictEqual([stubAuthData]);
        });

        it("Return empty list when no auth data are existing", async () => {
          delete process.env[VercelAPLVariables.AUTH_DATA_VARIABLE_NAME];

          const apl = new VercelAPL(aplConfig);

          expect(await apl.getAll()).toStrictEqual([]);
        });
      });
    });

    describe("isReady", () => {
      it("Returns error with message mentioning missing env variables", async () => {
        const apl = new VercelAPL(aplConfig);

        const result = await apl.isReady();

        if (!result.ready) {
          expect(result.error.message).toEqual(
            "Env variables: \"SALEOR_AUTH_DATA\", \"SALEOR_REGISTER_APP_URL\", \"SALEOR_DEPLOYMENT_TOKEN\" not found or is empty. Ensure env variables exist"
          );
        } else {
          throw new Error("This should not happen");
        }
      });
    });
  });
});
