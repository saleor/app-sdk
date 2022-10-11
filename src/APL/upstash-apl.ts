/* eslint-disable class-methods-use-this */
// eslint-disable-next-line max-classes-per-file
import fetch, { Response } from "node-fetch";

import { APL, AplReadyResult, AuthData } from "./apl";
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

export type UpstashAPLConfig = {
  restURL: string;
  restToken: string;
};

// https://docs.upstash.com/redis/features/restapi
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

  private async saveDataToUpstash(authData?: AuthData) {
    debug("saveDataToUpstash() called with: %j", {
      domain: authData?.domain,
      token: authData?.token.substring(0, 4),
    });

    await this.upstashRequest(`["SET", "${authData?.domain}", "${authData?.token}"]`);
  }

  private async deleteDataFromUpstash(domain: string) {
    await this.upstashRequest(`["DEL", "${domain}"]`);
  }

  private async fetchDataFromUpstash(domain: string) {
    const result = await this.upstashRequest(`["GET", "${domain}"]`);
    if (result) {
      return { domain, token: result };
    }
    return undefined;
  }

  async get(domain: string) {
    return this.fetchDataFromUpstash(domain);
  }

  async set(authData: AuthData) {
    await this.saveDataToUpstash(authData);
  }

  async delete(domain: string) {
    await this.deleteDataFromUpstash(domain);
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
}
