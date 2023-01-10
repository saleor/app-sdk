import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";
import { authDataFromObject } from "./auth-data-from-object";

const debug = createAPLDebug("SaleorCloudAPL");

export type SaleorCloudAPLConfig = {
  resourceUrl: string;
  token: string;
};

const validateResponseStatus = (response: Response) => {
  if (!response.ok) {
    debug("Response failed with status %s", response.status);

    throw new Error(`Fetch returned with non 200 status code ${response.status}`);
  }
};

/**
 * TODO Add test
 */
export class SaleorCloudAPL implements APL {
  private readonly resourceUrl: string;

  private headers?: Record<string, string>;

  constructor(config: SaleorCloudAPLConfig) {
    this.resourceUrl = config.resourceUrl;
    this.headers = {
      Authorization: `Bearer ${config.token}`,
    };
  }

  private getUrlForDomain(apiUrl: string) {
    // API URL has to be base64 encoded
    return `${this.resourceUrl}/${btoa(apiUrl)}`;
  }

  async get(apiUrl: string): Promise<AuthData | undefined> {
    debug("Will fetch data from SaleorCloudAPL for apiUrl %s", apiUrl);

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
    debug("Saving data to SaleorCloudAPL for domain: %s", authData.domain);

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

  async delete(apiUrl: string) {
    debug("Deleting data from SaleorCloud for apiUrl: %s", apiUrl);

    try {
      const response = await fetch(this.getUrlForDomain(apiUrl), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...this.headers },
      });

      debug(`Delete responded with ${response.status} code`);
    } catch (error) {
      debug("Error during deleting the data: %s", error);

      throw new Error(`Error during deleting the data: ${error}`);
    }
  }

  async getAll() {
    debug("Get all data from SaleorCloud");

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
          error: new Error("SaleorCloudAPL is not configured"),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    if (!this.resourceUrl) {
      debug("Resource URL has not been specified.");
      return {
        configured: false,
        error: new Error("SaleorCloudAPL required resourceUrl param"),
      };
    }

    return {
      configured: true,
    };
  }
}
