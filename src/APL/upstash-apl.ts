/* eslint-disable class-methods-use-this */
// eslint-disable-next-line max-classes-per-file
import fetch, { Response } from "node-fetch";

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

  private async upstashRequest(requestBody: string) {
    debug("Sending request to Upstash");
    if (!this.restURL || !this.restToken) {
      throw new Error(
        "UpstashAPL is not configured. See https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md"
      );
    }
    let response: Response;
    try {
      response = await fetch(this.restURL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.restToken}` },
        body: requestBody,
      });
    } catch (error) {
      debug("Error during sending the data:", error);
      throw new Error(`UpstashAPL was unable to perform a request ${error}`);
    }
    if (response.status >= 400 || response.status < 200) {
      debug("Non 200 response code. Upstash responded with %j", response);
      throw new Error(`Upstash APL responded with the code ${response.status}`);
    }
    const parsedResponse = (await response.json()) as UpstashResponse;
    if ("error" in parsedResponse) {
      debug("Upstash API responded with error: %s", parsedResponse.error);
      throw new Error("Upstash APL was not able to perform operation");
    }
    debug("Register service responded successfully");
    return parsedResponse.result;
  }

  private async saveDataToUpstash(authData: AuthData) {
    debug("saveDataToUpstash() called with: %j", {
      apiUrl: authData.apiUrl,
      token: authData.token.substring(0, 4),
    });

    const data = JSON.stringify(authData);
    await this.upstashRequest(`["SET", "${authData.apiUrl}", "${data}"]`);
  }

  private async deleteDataFromUpstash(apiUrl: string) {
    await this.upstashRequest(`["DEL", "${apiUrl}"]`);
  }

  private async fetchDataFromUpstash(apiUrl: string) {
    const result = await this.upstashRequest(`["GET", "${apiUrl}"]`);
    if (result) {
      const authData = JSON.parse(result);
      return authData;
    }
    return undefined;
  }

  async get(apiUrl: string) {
    return this.fetchDataFromUpstash(apiUrl);
  }

  async set(authData: AuthData) {
    await this.saveDataToUpstash(authData);
  }

  async delete(apiUrl: string) {
    await this.deleteDataFromUpstash(apiUrl);
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
