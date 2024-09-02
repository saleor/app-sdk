import { SpanKind, SpanStatusCode, Tracer } from "@opentelemetry/api";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";

import { hasProp } from "../../has-prop";
import { getOtelTracer, OTEL_APL_SERVICE_NAME } from "../../open-telemetry";
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "../apl";
import { createAPLDebug } from "../apl-debug";
import { authDataFromObject } from "../auth-data-from-object";
import { Paginator } from "./paginator";
import { CloudAplError, SaleorCloudAplError } from "./saleor-cloud-apl-errors";

const debug = createAPLDebug("SaleorCloudAPL");

export type SaleorCloudAPLConfig = {
  resourceUrl: string;
  token: string;
  experimental?: {
    cacheManager?: Map<string, AuthData>;
  };
  pageLimit?: number;
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
  next: string | null;
  previous: string | null;
  results: CloudAPLAuthDataShape[];
};

const validateResponseStatus = (response: Response) => {
  if (!response.ok) {
    debug("Response failed with status %s", response.status);
    debug("%O", response);

    throw new SaleorCloudAplError(
      CloudAplError.RESPONSE_NON_200,
      `Fetch returned with non 200 status code ${response.status}`
    );
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

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (hasProp(error, "message")) {
    return error.message as string;
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

  private tracer: Tracer;

  private cacheManager?: Map<string, AuthData>;

  private readonly pageLimit: number;

  constructor(config: SaleorCloudAPLConfig) {
    this.resourceUrl = config.resourceUrl;
    this.headers = {
      Authorization: `Bearer ${config.token}`,
    };

    this.tracer = getOtelTracer();
    this.cacheManager = config?.experimental?.cacheManager;
    this.pageLimit = config.pageLimit ?? 1000;
  }

  private getUrlForDomain(saleorApiUrl: string) {
    // API URL has to be base64url encoded
    return `${this.resourceUrl}/${Buffer.from(saleorApiUrl).toString("base64url")}`;
  }

  private getUrlWithLimit() {
    return `${this.resourceUrl}?limit=${this.pageLimit}`;
  }

  private setToCacheIfExists(saleorApiUrl: string, authData: AuthData) {
    if (!this.cacheManager) {
      return;
    }

    this.cacheManager.set(authData.saleorApiUrl, authData);
  }

  private deleteFromCacheIfExists(saleorApiUrl: string) {
    if (!this.cacheManager) {
      return;
    }

    this.cacheManager.delete(saleorApiUrl);
  }

  private getFromCacheIfExists(saleorApiUrl: string) {
    return this.cacheManager?.get(saleorApiUrl);
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const cachedData = this.getFromCacheIfExists(saleorApiUrl);

    if (cachedData) {
      debug("Returning authData from cache for saleorApiUrl %s", saleorApiUrl);
      return cachedData;
    }

    debug("Will fetch data from SaleorCloudAPL for saleorApiUrl %s", saleorApiUrl);

    return this.tracer.startActiveSpan(
      "SaleorCloudAPL.get",
      {
        attributes: {
          saleorApiUrl,
          [SemanticAttributes.PEER_SERVICE]: OTEL_APL_SERVICE_NAME,
        },
        kind: SpanKind.CLIENT,
      },
      async (span) => {
        const response = await fetch(this.getUrlForDomain(saleorApiUrl), {
          method: "GET",
          headers: { "Content-Type": "application/json", ...this.headers },
        }).catch((error) => {
          debug("Failed to reach API call:  %s", extractErrorMessage(error));
          debug("%O", error);

          span.recordException(CloudAplError.FAILED_TO_REACH_API);
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: extractErrorMessage(error),
            })
            .end();

          throw new SaleorCloudAplError(
            CloudAplError.FAILED_TO_REACH_API,
            `${extractErrorMessage(error)}`
          );
        });

        if (!response) {
          debug("No response from the API");

          span.recordException(CloudAplError.FAILED_TO_REACH_API);
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "Response couldn't be resolved",
            })
            .end();

          throw new SaleorCloudAplError(
            CloudAplError.FAILED_TO_REACH_API,
            "Response couldn't be resolved"
          );
        }

        if (response.status >= 500) {
          const message = `Api responded with ${response.status}`;

          span.recordException(CloudAplError.FAILED_TO_REACH_API);
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message,
            })
            .end();

          throw new SaleorCloudAplError(CloudAplError.FAILED_TO_REACH_API, message);
        }

        if (response.status === 404) {
          debug("No auth data for given saleorApiUrl");

          span.addEvent("Missing auth data for given saleorApiUrl");
          span
            .setStatus({
              code: SpanStatusCode.OK,
            })
            .end();

          return undefined;
        }

        const parsedResponse = (await response.json().catch((e) => {
          debug("Failed to parse response: %s", extractErrorMessage(e));
          debug("%O", e);

          const message = `Cant parse response body: ${extractErrorMessage(e)}`;

          span.recordException(CloudAplError.RESPONSE_BODY_INVALID);
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message,
            })
            .end();

          throw new SaleorCloudAplError(CloudAplError.RESPONSE_BODY_INVALID, message);
        })) as CloudAPLAuthDataShape;

        const authData = authDataFromObject(mapAPIResponseToAuthData(parsedResponse));

        if (!authData) {
          debug("No auth data for given saleorApiUrl");

          span.addEvent("Missing auth data for given saleorApiUrl");
          span
            .setStatus({
              code: SpanStatusCode.OK,
            })
            .end();

          return undefined;
        }

        span.setAttribute("appId", authData.appId);

        this.setToCacheIfExists(authData.saleorApiUrl, authData);

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        return authData;
      }
    );
  }

  async set(authData: AuthData) {
    debug("Saving data to SaleorCloudAPL for saleorApiUrl: %s", authData.saleorApiUrl);

    return this.tracer.startActiveSpan(
      "SaleorCloudAPL.set",
      {
        attributes: {
          saleorApiUrl: authData.saleorApiUrl,
          appId: authData.appId,
          [SemanticAttributes.PEER_SERVICE]: OTEL_APL_SERVICE_NAME,
        },
        kind: SpanKind.CLIENT,
      },
      async (span) => {
        const response = await fetch(this.resourceUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...this.headers },
          body: JSON.stringify(mapAuthDataToAPIBody(authData)),
        }).catch((e) => {
          debug("Failed to reach API call:  %s", extractErrorMessage(e));
          debug("%O", e);

          span.recordException(`Failed to reach API call:  ${extractErrorMessage(e)}`);
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
            })
            .end();

          throw new SaleorCloudAplError(
            CloudAplError.ERROR_SAVING_DATA,
            `Error during saving the data: ${extractErrorMessage(e)}`
          );
        });

        validateResponseStatus(response);

        debug("Set command finished successfully for saleorApiUrl: %", authData.saleorApiUrl);

        this.setToCacheIfExists(authData.saleorApiUrl, authData);

        span.setStatus({
          code: SpanStatusCode.OK,
        });
        span.end();

        return undefined;
      }
    );
  }

  async delete(saleorApiUrl: string) {
    debug("Deleting data from SaleorCloud for saleorApiUrl: %s", saleorApiUrl);

    try {
      const response = await fetch(this.getUrlForDomain(saleorApiUrl), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...this.headers },
      });

      this.deleteFromCacheIfExists(saleorApiUrl);

      debug(`Delete responded with ${response.status} code`);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      debug("Error during deleting the data: %s", errorMessage);
      debug("%O", error);

      throw new SaleorCloudAplError(
        CloudAplError.ERROR_DELETING_DATA,
        `Error during deleting the data: ${errorMessage}`
      );
    }
  }

  async getAll() {
    debug("Get all data from SaleorCloud");

    try {
      const paginator = new Paginator<CloudAPLAuthDataShape>(this.getUrlWithLimit(), {
        method: "GET",
        headers: { "Content-Type": "application/json", ...this.headers },
      });
      const responses = await paginator.fetchAll();
      return responses.results.map(mapAPIResponseToAuthData);
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
