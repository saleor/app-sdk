/* eslint-disable class-methods-use-this */
// eslint-disable-next-line max-classes-per-file
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("UpstashAPL");

type SuccessResponse = { result: string };
type ErrorResponse = { error: string };
type UpstashResponse = SuccessResponse | ErrorResponse;

export const UpstashAPLVariables = {
  UPSTASH_TOKEN: "UPSTASH_TOKEN",
  UPSTASH_URL: "UPSTASH_URL",
};

export class UpstashAplMisconfiguredError extends Error {
  constructor(public missingVars: string[]) {
    super(
      `Configuration values for: ${missingVars
        .map((v) => `"${v}"`)
        .join(", ")} not found or is empty. Pass values to constructor of use env variables.`
    );
  }
}

export class UpstashAplNotConfiguredError extends Error {}

export type UpstashAPLConfig = {
  restURL: string;
  restToken: string;
};

/**
 * Upstash APL
 *
 * Use [Upstash](https://upstash.com) which is SaaS Redis provider, to store auth data.
 * You can create free developer account and use it to develop multi-tenant apps.
 *
 * Configuration require 2 elements: URL to the REST service and auth token. Both can be
 * found in the Upstash dashboard. You can choose to store them using environment variables
 * (`UPSTASH_URL` and `UPSTASH_TOKEN`) or pass directly to APL's constructor.
 */
export class UpstashAPL implements APL {
  private restURL?: string;

  private restToken?: string;

  constructor(config?: UpstashAPLConfig) {
    const restURL = config?.restURL || process.env[UpstashAPLVariables.UPSTASH_URL];
    const restToken = config?.restToken || process.env[UpstashAPLVariables.UPSTASH_TOKEN];

    this.restURL = restURL;
    this.restToken = restToken;
  }

  private async upstashRequest(request: string[]) {
    debug("Sending request to Upstash");
    if (!this.restURL || !this.restToken) {
      throw new Error(
        "UpstashAPL is not configured. See https://docs.saleor.io/docs/3.x/developer/extending/apps/developing-apps/app-sdk/apl"
      );
    }
    let response: Response;
    try {
      response = await fetch(this.restURL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.restToken}` },
        body: JSON.stringify(request),
      });
    } catch (error) {
      debug("Error during sending the data:", error);
      throw new Error(`UpstashAPL was unable to perform a request ${error}`);
    }

    const parsedResponse = (await response.json()) as UpstashResponse;
    if (!response.ok || "error" in parsedResponse) {
      debug(`Operation unsuccessful. Upstash API has responded with ${response.status} code`);
      if ("error" in parsedResponse) {
        debug("Error message: %s", parsedResponse.error);
        throw new Error(
          `Upstash APL was not able to perform operation. Status code: ${response.status}. Error: ${parsedResponse.error}`
        );
      }
      throw new Error(
        `Upstash APL was not able to perform operation. Status code: ${response.status}`
      );
    }
    debug("Upstash service responded successfully");
    return parsedResponse.result;
  }

  private async saveDataToUpstash(authData: AuthData) {
    debug("saveDataToUpstash() called with: %j", {
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token.substring(0, 4),
    });

    const data = JSON.stringify(authData);
    await this.upstashRequest(["SET", authData.saleorApiUrl, data]);
  }

  private async deleteDataFromUpstash(saleorApiUrl: string) {
    await this.upstashRequest(["DEL", saleorApiUrl]);
  }

  private async fetchDataFromUpstash(saleorApiUrl: string) {
    const result = await this.upstashRequest(["GET", saleorApiUrl]);
    if (result) {
      const authData = JSON.parse(result) as AuthData;
      return authData;
    }
    return undefined;
  }

  async get(saleorApiUrl: string) {
    return this.fetchDataFromUpstash(saleorApiUrl);
  }

  async set(authData: AuthData) {
    await this.saveDataToUpstash(authData);
  }

  async delete(saleorApiUrl: string) {
    await this.deleteDataFromUpstash(saleorApiUrl);
  }

  async getAll() {
    throw new Error("UpstashAPL does not support getAll method");
    return [];
  }

  // eslint-disable-next-line class-methods-use-this
  async isReady(): Promise<AplReadyResult> {
    const missingConf: string[] = [];
    if (!this.restToken) {
      missingConf.push("restToken");
    }
    if (!this.restURL) {
      missingConf.push("restURL");
    }

    if (missingConf.length > 0) {
      return {
        ready: false,
        error: new UpstashAplMisconfiguredError(missingConf),
      };
    }

    return {
      ready: true,
    };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    return this.restToken && this.restURL
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new UpstashAplNotConfiguredError(
            "UpstashAPL not configured. Check if REST URL and token provided in constructor or env"
          ),
        };
  }
}
