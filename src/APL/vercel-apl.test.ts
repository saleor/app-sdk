import { rest } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { VercelAPL, VercelAPLVariables } from "./vercel-apl";

const handlers = [
  rest.post("https://registerService.example.com/internalError", async (req, res, ctx) =>
    res(ctx.status(500))
  ),
  rest.post("https://registerService.example.com/", async (req, res, ctx) => {
    const body = await req.json();
    // Register service will return error when request does not provide token and envs
    if (!body?.token || !body?.envs) {
      return res(ctx.status(400));
    }

    // Check if envs follow the anticipated format
    const envs = body.envs as Record<string, string | undefined>[];
    for (const env of envs) {
      if (typeof env.key === "undefined" || typeof env?.value === "undefined") {
        return res(ctx.status(400));
      }
    }
    return res(ctx.status(200));
  }),
];

export const server = setupServer(...handlers);

const aplConfig = {
  deploymentToken: "token",
  registerAppURL: "http://example.com",
};

const stubAuthData = {
  domain: "example.com",
  token: "example-token",
};

describe("APL", () => {
  const initialEnv = { ...process.env };

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    process.env = { ...initialEnv };
    server.resetHandlers();
  });

  describe("VercelAPL", () => {
    describe("constructor", () => {
      it("Raise an error when configuration is missing", async () => {
        delete process.env[VercelAPLVariables.SALEOR_REGISTER_APP_URL];
        process.env[VercelAPLVariables.SALEOR_DEPLOYMENT_TOKEN] = "token";

        expect(() => new VercelAPL()).toThrow();

        process.env[VercelAPLVariables.SALEOR_REGISTER_APP_URL] = "http://example.com";
        delete process.env[VercelAPLVariables.SALEOR_DEPLOYMENT_TOKEN];

        expect(() => new VercelAPL()).toThrow();
      });
    });

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
        const apl = new VercelAPL({
          registerAppURL: "https://registerService.example.com",
          deploymentToken: "token",
        });
        expect(await apl.set({ domain: "example.com", token: "token" })).toBe(undefined);
      });

      it("Raise error when register service returns non 200 response", async () => {
        const apl = new VercelAPL({
          registerAppURL: "https://registerService.example.com/internalError",
          deploymentToken: "token",
        });
        await expect(apl.set({ domain: "example.com", token: "token" })).rejects.toThrow(
          "Vercel APL was not able to save auth data, register service responded with the code 500"
        );
      });
    });

    describe("get", () => {
      describe("Read existing auth data from env", () => {
        it("Read existing auth data", async () => {
          process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME] = stubAuthData.token;
          process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME] = stubAuthData.domain;

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get(stubAuthData.domain)).toStrictEqual(stubAuthData);
        });

        it("Return undefined when unknown domain requested", async () => {
          process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME] = stubAuthData.token;
          process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME] = stubAuthData.domain;

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get("unknown-domain.example.com")).toBe(undefined);
        });

        it("Return undefined when no data is defined", async () => {
          delete process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME];
          delete process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME];

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get("example.com")).toBe(undefined);
        });
      });
    });

    describe("getAll", () => {
      describe("Read existing auth data from env", () => {
        it("Read existing auth data", async () => {
          process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME] = stubAuthData.token;
          process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME] = stubAuthData.domain;

          const apl = new VercelAPL(aplConfig);

          expect(await apl.getAll()).toStrictEqual([stubAuthData]);
        });

        it("Return empty list when no auth data are existing", async () => {
          delete process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME];
          delete process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME];

          const apl = new VercelAPL(aplConfig);

          expect(await apl.getAll()).toStrictEqual([]);
        });
      });
    });
  });
});
