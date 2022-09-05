import { afterEach, describe, expect, it } from "vitest";

import { VercelAPL, VercelAPLVariables } from "./vercel-apl";

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

  afterEach(() => {
    process.env = { ...initialEnv };
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
