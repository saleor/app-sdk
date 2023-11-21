import { hasProp } from "../../has-prop";
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "../apl";
import { createAPLDebug } from "../apl-debug";
import { authDataFromObject } from "../auth-data-from-object";
import { SaleorCloudAplError } from "./saleor-cloud-apl-errors";

const debug = createAPLDebug("SaleorCloudAPL");

export type SaleorCloudAPLConfig = {
  resourceUrl: string;
  token: string;
};

type CloudAPLAuthDataShape = {
  saleor_api_url: string;
  token: string;
  jwks: string;
  saleor_app_id: string;
  domain: string;
};

export type GetAllAplResponseShape = {
  count: number;
  results: CloudAPLAuthDataShape[];
};

export const CloudAplError = {
  FAILED_TO_REACH_API: "FAILED_TO_REACH_API",
  RESPONSE_BODY_INVALID: "RESPONSE_BODY_INVALID",
};

const validateResponseStatus = (response: Response) => {
  if (!response.ok) {
    debug("Response failed with status %s", response.status);
    debug("%O", response);

    throw new Error(`Fetch returned with non 200 status code ${response.status}`);
  }
};

const mapAuthDataToAPIBody = (authData: AuthData) => ({
  saleor_app_id: authData.appId,
  saleor_api_url: authData.saleorApiUrl,
  jwks: authData.jwks,
  domain: authData.domain,
  token: authData.token,
});

const mapAPIResponseToAuthData = (response: CloudAPLAuthDataShape): AuthData => ({
  appId: response.saleor_app_id,
  domain: response.domain,
  jwks: response.jwks,
  saleorApiUrl: response.saleor_api_url,
  token: response.token,
});

const extractErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (hasProp(error, "message")) {
    return error.message;
  }

  return "Unknown error";
};

/**
 *
 * Saleor Cloud APL - handle auth data management via REST API.
 *
 * Required configuration options:
 * - `resourceUrl` URL to the REST API
 * - `token` Authorization token assigned to your deployment
 *
 */
export class SaleorCloudAPL implements APL {
  private readonly resourceUrl: string;

  private headers: Record<string, string>;

  constructor(config: SaleorCloudAPLConfig) {
    this.resourceUrl = config.resourceUrl;
    this.headers = {
      Authorization: `Bearer ${config.token}`,
    };
  }

  private getUrlForDomain(saleorApiUrl: string) {
    // API URL has to be base64url encoded
    return `${this.resourceUrl}/${Buffer.from(saleorApiUrl).toString("base64url")}`;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    debug("Will fetch data from SaleorCloudAPL for saleorApiUrl %s", saleorApiUrl);

    const response = await fetch(this.getUrlForDomain(saleorApiUrl), {
      method: "GET",
      headers: { "Content-Type": "application/json", ...this.headers },
    }).catch((error) => {
      debug("Failed to reach API call:  %s", extractErrorMessage(error));
      debug("%O", error);

      throw new SaleorCloudAplError(
        CloudAplError.FAILED_TO_REACH_API,
        `${extractErrorMessage(error)}`
      );
    });

    if (!response) {
      debug("No response from the API");

      throw new SaleorCloudAplError(
        CloudAplError.FAILED_TO_REACH_API,
        "Response couldnt be resolved"
      );
    }

    if (response.status >= 500) {
      throw new SaleorCloudAplError(
        CloudAplError.FAILED_TO_REACH_API,
        `Api responded with ${response.status}`
      );
    }

    if (response.status === 404) {
      debug("No auth data for given saleorApiUrl");
      return undefined;
    }

    const parsedResponse = (await response.json().catch((e) => {
      debug("Failed to parse response: %s", extractErrorMessage(e));
      debug("%O", e);

      throw new SaleorCloudAplError(
        CloudAplError.RESPONSE_BODY_INVALID,
        `Cant parse response body: ${extractErrorMessage(e)}`
      );
    })) as CloudAPLAuthDataShape;

    const authData = authDataFromObject(mapAPIResponseToAuthData(parsedResponse));

    if (!authData) {
      debug("No auth data for given saleorApiUrl");
      return undefined;
    }

    return authData;
  }

  async set(authData: AuthData) {
    debug("Saving data to SaleorCloudAPL for saleorApiUrl: %s", authData.saleorApiUrl);

    const response = await fetch(this.resourceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify(mapAuthDataToAPIBody(authData)),
    }).catch((e) => {
      debug("Failed to reach API call:  %s", extractErrorMessage(e));
      debug("%O", e);

      throw new Error(`Error during saving the data: ${extractErrorMessage(e)}`);
    });

    validateResponseStatus(response);

    debug("Set command finished successfully for saleorApiUrl: %", authData.saleorApiUrl);

    return undefined;
  }

  async delete(saleorApiUrl: string) {
    debug("Deleting data from SaleorCloud for saleorApiUrl: %s", saleorApiUrl);

    try {
      const response = await fetch(this.getUrlForDomain(saleorApiUrl), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...this.headers },
      });

      debug(`Delete responded with ${response.status} code`);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      debug("Error during deleting the data: %s", errorMessage);
      debug("%O", error);

      throw new Error(`Error during deleting the data: ${errorMessage}`);
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

      return ((await response.json()) as GetAllAplResponseShape).results.map(
        mapAPIResponseToAuthData
      );
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      debug("Error during getting all the data:", errorMessage);
      debug("%O", error);
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
