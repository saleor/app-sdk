/* eslint-disable class-methods-use-this */
import debugPkg from "debug";
import fetch from "node-fetch";

import { APL, AuthData } from "./apl";

const debug = debugPkg.debug("app-sdk:VercelAPL");

export const VercelAPLVariables = {
  TOKEN_VARIABLE_NAME: "SALEOR_AUTH_TOKEN",
  DOMAIN_VARIABLE_NAME: "SALEOR_DOMAIN",
  SALEOR_REGISTER_APP_URL: "SALEOR_REGISTER_APP_URL",
  SALEOR_DEPLOYMENT_TOKEN: "SALEOR_DEPLOYMENT_TOKEN",
};

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
 * theres Saleor microservice which update new values with the Vercel API and restarts the instance.
 *
 * This APL should be used for single tenant purposes due to it's limitations:
 *   - only stores single auth data entry (setting up a new one will overwrite previous values)
 *   - changing the environment variables require server restart
 *
 * With this APL we recommend using the [Saleor CLI](https://docs.saleor.io/docs/3.x/cli),
 * which automatically set up the required environment variables during deployment:
 *   - SALEOR_REGISTER_APP_URL: the URL for microservice which set up variables using Vercel API
 *   - SALEOR_DEPLOYMENT_TOKEN: token for your particular Vercel deployment
 */
export class VercelAPL implements APL {
  private registerAppURL: string;

  private deploymentToken: string;

  constructor(config?: VercelAPLConfig) {
    const registerAppURL =
      config?.registerAppURL || process.env[VercelAPLVariables.SALEOR_REGISTER_APP_URL];
    if (!registerAppURL) {
      throw new Error("Misconfiguration: please provide registerAppUrl");
    }
    const deploymentToken =
      config?.deploymentToken || process.env[VercelAPLVariables.SALEOR_DEPLOYMENT_TOKEN];
    if (!deploymentToken) {
      throw new Error("Misconfiguration: please provide deploymentToken");
    }

    this.registerAppURL = registerAppURL;
    this.deploymentToken = deploymentToken;
  }

  private async saveDataToVercel(authData?: AuthData) {
    debug(`saveDataToVercel with: ${authData}`);
    try {
      await fetch(this.registerAppURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: this.deploymentToken,
          envs: {
            [VercelAPLVariables.TOKEN_VARIABLE_NAME]: authData?.token || "",
            [VercelAPLVariables.DOMAIN_VARIABLE_NAME]: authData?.domain || "",
          },
        }),
      });
    } catch (error) {
      debug("Error during saving the data:", error);
      throw new Error(`VercelAPL was not able to save auth data${error}`);
    }
  }

  async get(domain: string) {
    const authData = getEnvAuth();

    if (authData && domain === authData?.domain) {
      return authData;
    }
    return undefined;
  }

  async set(authData: AuthData) {
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
}
