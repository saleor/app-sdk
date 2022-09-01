import { afterEach, describe, expect, it } from "vitest";

import {
  DOMAIN_VARIABLE_NAME,
  SALEOR_DEPLOYMENT_TOKEN,
  SALEOR_REGISTER_APP_URL,
  TOKEN_VARIABLE_NAME,
  VercelAPL,
} from "./vercelAPL";

const aplConfig = {
  deploymentToken: "token",
  registerAppURL: "http://example.com",
};

const stubAuthData = {
  domain: "example.com",
  token: "example-token",
};

describe("APL", () => {
  describe("VercelAPL", () => {
    describe("constructor", () => {
      const initialEnv = { ...process.env };

      afterEach(() => {
        process.env = { ...initialEnv };
      });

      it("Raise an error when configuration is missing", async () => {
        delete process.env[SALEOR_REGISTER_APP_URL];
        process.env[SALEOR_DEPLOYMENT_TOKEN] = "token";

        expect(() => new VercelAPL()).toThrow();

        process.env[SALEOR_REGISTER_APP_URL] = "http://example.com";
        delete process.env[SALEOR_DEPLOYMENT_TOKEN];

        expect(() => new VercelAPL()).toThrow();
      });
    });

    it("Constructor with config values", async () => {
      expect(() => new VercelAPL(aplConfig)).not.toThrow();
    });

    it("Constructor with config values from environment variables", async () => {
      process.env[SALEOR_REGISTER_APP_URL] = aplConfig.registerAppURL;
      process.env[SALEOR_DEPLOYMENT_TOKEN] = aplConfig.deploymentToken;

      expect(() => new VercelAPL()).not.toThrow();
    });

    describe("get", () => {
      describe("Read existing auth data from env", () => {
        const initialEnv = { ...process.env };

        afterEach(() => {
          process.env = { ...initialEnv };
        });

        it("Read existing auth data", async () => {
          process.env[TOKEN_VARIABLE_NAME] = stubAuthData.token;
          process.env[DOMAIN_VARIABLE_NAME] = stubAuthData.domain;

          const apl = new VercelAPL();

          expect(await apl.get(stubAuthData.domain)).toStrictEqual(stubAuthData);
        });

        it("Return undefined when unknown domain requested", async () => {
          process.env[TOKEN_VARIABLE_NAME] = stubAuthData.token;
          process.env[DOMAIN_VARIABLE_NAME] = stubAuthData.domain;

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get("unknown-domain.example.com")).toBe(undefined);
        });

        it("Return undefined when no data is defined", async () => {
          delete process.env[TOKEN_VARIABLE_NAME];
          delete process.env[DOMAIN_VARIABLE_NAME];

          const apl = new VercelAPL(aplConfig);

          expect(await apl.get("example.com")).toBe(undefined);
        });
      });
    });

    describe("getAll", () => {
      describe("Read existing auth data from env", () => {
        const initialEnv = { ...process.env };

        afterEach(() => {
          process.env = { ...initialEnv };
        });

        it("Read existing auth data", async () => {
          process.env[TOKEN_VARIABLE_NAME] = stubAuthData.token;
          process.env[DOMAIN_VARIABLE_NAME] = stubAuthData.domain;

          const apl = new VercelAPL(aplConfig);

          expect(await apl.getAll()).toStrictEqual([stubAuthData]);
        });

        it("Return empty list when no auth data are existing", async () => {
          delete process.env[TOKEN_VARIABLE_NAME];
          delete process.env[DOMAIN_VARIABLE_NAME];

          const apl = new VercelAPL(aplConfig);

          expect(await apl.getAll()).toStrictEqual([]);
        });
      });
    });
  });
});
