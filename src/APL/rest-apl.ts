import { hasProp } from "../has-prop";
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("RestAPL");

export type RestAPLConfig = {
  resourceUrl: string;
  headers?: Record<string, string>;
};

const validateResponseStatus = (response: Response) => {
  if (response.status < 200 || response.status >= 400) {
    debug("Response failed with status %s", response.status);

    throw new Error(`Fetch returned with non 200 status code ${response.status}`);
  }
};

/**
 * TODO Add test
 */
export class RestAPL implements APL {
  private readonly resourceUrl: string;

  private headers?: Record<string, string>;

  constructor(config: RestAPLConfig) {
    this.resourceUrl = config.resourceUrl;
    this.headers = config.headers;
  }

  private getUrlForDomain(domain: string) {
    return `${this.resourceUrl}/${domain}`;
  }

  async get(domain: string): Promise<AuthData | undefined> {
    debug("Will fetch data from RestAPL for domain %s", domain);

    const response = await fetch(this.getUrlForDomain(domain), {
      method: "GET",
      headers: { "Content-Type": "application/json", ...this.headers },
    }).catch((error) => {
      debug("Failed to reach API call:  %s", error?.message ?? "Unknown error");
      throw new Error(`Attempt in fetch the data resulted with error: ${error}`);
    });

    validateResponseStatus(response);

    const parsedResponse = (await response.json().catch((e) => {
      debug("Failed to parse response: %s", e?.message ?? "Unknown error");
    })) as unknown;

    if (hasProp(parsedResponse, "domain") && hasProp(parsedResponse, "token")) {
      return { domain: parsedResponse.domain as string, token: parsedResponse.token as string };
    }

    debug("Response had no domain and token.");

    return undefined;
  }

  async set(authData: AuthData) {
    debug("Saving data to RestAPL for domain: %s", authData.domain);

    const response = await fetch(this.resourceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify(authData),
    }).catch((e) => {
      debug("Failed to reach API call:  %s", e?.message ?? "Unknown error");

      throw new Error(`Error during saving the data: ${e}`);
    });

    validateResponseStatus(response);

    debug("Set command finished successfully for domain: %", authData.domain);

    return undefined;
  }

  async delete(domain: string) {
    debug("Deleting data from Rest for domain: %s", domain);

    try {
      const response = await fetch(this.getUrlForDomain(domain), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...this.headers },
        body: JSON.stringify({ domain }),
      });

      debug(`Delete responded with ${response.status} code`);
    } catch (error) {
      debug("Error during deleting the data: %s", error);

      throw new Error(`Error during saving the data: ${error}`);
    }
  }

  async getAll() {
    debug("Get all data from Rest");

    try {
      const response = await fetch(this.resourceUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...this.headers },
      });

      debug(`Get all responded with ${response.status} code`);

      return ((await response.json()) as AuthData[]) || [];
    } catch (error) {
      debug("Error during getting all the data:", error);
    }

    return [];
  }

  async isReady(): Promise<AplReadyResult> {
    const configured = await this.isConfigured();

    return configured
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new Error("App is not configured"),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    if (!this.resourceUrl) {
      return {
        configured: false,
        error: new Error("RestAPL required resourceUrl param"),
      };
    }

    return {
      configured: true,
    };
  }
}
