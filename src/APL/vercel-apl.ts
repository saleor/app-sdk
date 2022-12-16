/* eslint-disable class-methods-use-this */
// eslint-disable-next-line max-classes-per-file
import fetch, { Response } from "node-fetch";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("VercelAPL");

export const VercelAPLVariables = {
  TOKEN_VARIABLE_NAME: "SALEOR_AUTH_TOKEN",
  DOMAIN_VARIABLE_NAME: "SALEOR_DOMAIN",
  SALEOR_REGISTER_APP_URL: "SALEOR_REGISTER_APP_URL",
  SALEOR_DEPLOYMENT_TOKEN: "SALEOR_DEPLOYMENT_TOKEN",
};

export class VercelAplNotReadyError extends Error {
  constructor(public missingEnvVars: string[]) {
    super(
      `Env variables: ${missingEnvVars
        .map((v) => `"${v}"`)
        .join(", ")} not found or is empty. Ensure env variables exist`
    );
  }
}

export class VercelAplNotConfiguredError extends Error {}

const getEnvAuth = (): AuthData | undefined => {
  const token = process.env[VercelAPLVariables.TOKEN_VARIABLE_NAME];
  const domain = process.env[VercelAPLVariables.DOMAIN_VARIABLE_NAME];
  if (!token || !domain) {
    return undefined;
  }
  return {
    token,
    domain,
  };
};

export type VercelAPLConfig = {
  registerAppURL?: string;
  deploymentToken?: string;
};
/** Vercel APL
 *
 * Use environment variables for auth data storage. To update data on existing deployment,
 * there's Saleor microservice which update new values with the Vercel API and restarts the instance.
 *
 * This APL should be used for single tenant purposes due to its limitations:
 *   - only stores single auth data entry (setting up a new one will overwrite previous values)
 *   - changing the environment variables require server restart
 *
 * To avoid override of existing auth data, setting a new auth token is only allowed for the same domain.
 * If you want to change registration to another domain, you have to remove `SALEOR_AUTH_TOKEN` and
 * `SALEOR_DOMAIN` environment variables in [Vercel dashboard](https://vercel.com/docs/concepts/projects/environment-variables).
 *
 * With this APL we recommend deployment using the [Saleor CLI](https://docs.saleor.io/docs/3.x/cli),
 * which automatically set up the required environment variables during deployment:
 *   - SALEOR_REGISTER_APP_URL: the URL for microservice which set up variables using Vercel API
 *   - SALEOR_DEPLOYMENT_TOKEN: token for your particular Vercel deployment
 */
export class VercelAPL implements APL {
  private registerAppURL?: string;

  private deploymentToken?: string;

  constructor(config?: VercelAPLConfig) {
    const registerAppURL =
      config?.registerAppURL || process.env[VercelAPLVariables.SALEOR_REGISTER_APP_URL];

    const deploymentToken =
      config?.deploymentToken || process.env[VercelAPLVariables.SALEOR_DEPLOYMENT_TOKEN];

    this.registerAppURL = registerAppURL;
    this.deploymentToken = deploymentToken;
  }

  private async saveDataToVercel(authData?: AuthData) {
    if (!this.registerAppURL) {
      throw new Error(
        "VercelAPL is not configured. See https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md"
      );
    }

    debug("saveDataToVercel() called with: %j", {
      domain: authData?.domain,
      token: authData?.token.substring(0, 4),
    });
    let response: Response;
    try {
      response = await fetch(this.registerAppURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: this.deploymentToken,
          envs: [
            { key: VercelAPLVariables.TOKEN_VARIABLE_NAME, value: authData?.token || "" },
            { key: VercelAPLVariables.DOMAIN_VARIABLE_NAME, value: authData?.domain || "" },
          ],
        }),
      });
    } catch (error) {
      debug("Error during saving the data:", error);
      throw new Error(`VercelAPL was not able to save auth data ${error}`);
    }
    if (response.status >= 400 || response.status < 200) {
      debug("Non 200 response code. Register service responded with %j", response);
      throw new Error(
        `Vercel APL was not able to save auth data, register service responded with the code ${response.status}`
      );
    }
    debug("Register service responded successfully");
  }

  async get(domain: string) {
    const authData = getEnvAuth();

    if (authData && domain === authData?.domain) {
      return authData;
    }
    return undefined;
  }

  async set(authData: AuthData) {
    const existingAuthData = getEnvAuth();
    if (existingAuthData && existingAuthData.domain !== authData.domain) {
      // Registering again should be available only for the already installed domain
      throw new Error("Vercel APL was not able to save auth data, application already registered");
    }
    await this.saveDataToVercel(authData);
  }

  async delete(domain: string) {
    if (domain === getEnvAuth()?.domain) {
      // Override existing data with the empty values
      await this.saveDataToVercel();
    }
  }

  async getAll() {
    const authData = getEnvAuth();
    if (!authData) {
      return [];
    }
    return [authData];
  }

  // eslint-disable-next-line class-methods-use-this
  async isReady(): Promise<AplReadyResult> {
    const invalidEnvKeys = Object.values(VercelAPLVariables).filter((key) => {
      const envValue = process.env[key];

      return !envValue || envValue.length === 0;
    });

    if (invalidEnvKeys.length > 0) {
      return {
        ready: false,
        error: new VercelAplNotReadyError(invalidEnvKeys),
      };
    }

    return {
      ready: true,
    };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    return this.registerAppURL && this.deploymentToken
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new VercelAplNotConfiguredError(
            "VercelAPL not configured. Check if register URL and deployment token provided in constructor or env "
          ),
        };
  }
}
