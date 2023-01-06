import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";
import { authDataFromObject } from "./auth-data-from-object";

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

  private getUrlForDomain(apiUrl: string) {
    return `${this.resourceUrl}/${btoa(apiUrl)}`;
  }

  async get(apiUrl: string): Promise<AuthData | undefined> {
    debug("Will fetch data from RestAPL for apiUrl %s", apiUrl);

    const response = await fetch(this.getUrlForDomain(apiUrl), {
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

    const authData = authDataFromObject(parsedResponse);
    if (!authData) {
      debug("No auth data for given apiUrl");
      return undefined;
    }

    return authData;
  }

  async set(authData: AuthData) {
    debug("Saving data to RestAPL for domain: %s", authData.domain);

    const response = await fetch(this.resourceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify({
        saleor_app_id: authData.appId,
        api_url: authData.apiUrl,
        jwks: authData.jwks,
        domain: authData.domain,
        token: authData.token,
      }),
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
      debug("Resource URL has not been specified.");
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
