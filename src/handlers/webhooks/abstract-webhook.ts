import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { ASTNode } from "graphql";
import { NextApiRequest, NextApiResponse } from "next";

import { APL } from "@/APL";
import { createDebug } from "@/debug";
import { fetchRemoteJwks } from "@/fetch-remote-jwks";
import { gqlAstToString } from "@/gql-ast-to-string";
import { WebhookContext, WebhookError } from "@/handlers/shared/process-saleor-webhook";
import { WebhookErrorCodeMap } from "@/handlers/shared/saleor-webhook";
import { getOtelTracer } from "@/open-telemetry";
import { AsyncWebhookEventType, SyncWebhookEventType, WebhookManifest } from "@/types";
import { parseSchemaVersion } from "@/util";
import { verifySignatureWithJwks } from "@/verify-signature";

import { ActionHandlerResult, PlatformAdapterInterface, PlatformAdapterMiddleware } from "../shared";

const debug = createDebug("SaleorWebhook");

export interface WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> {
  name?: string;
  webhookPath: string;
  event: Event;
  isActive?: boolean;
  apl: APL;
  onError?(error: WebhookError | Error, req: NextApiRequest, res: NextApiResponse): void;
  formatErrorResponse?(
    error: WebhookError | Error,
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<{
    code: number;
    body: object | string;
  }>;
  query: string | ASTNode;
  /**
   * @deprecated will be removed in 0.35.0, use query field instead
   */
  subscriptionQueryAst?: ASTNode;
}

export type NextWebhookApiHandler<TPayload = unknown, TExtras = {}> = (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: WebhookContext<TPayload> & TExtras
) => unknown | Promise<unknown>;

export abstract class SaleorWebhook<
  Fn,
  Request
> {
  name: string;

  webhookPath: string;

  query: string | ASTNode;

  event: AsyncWebhookEventType | SyncWebhookEventType;

  isActive?: boolean;

  apl: APL;

  onError: WebhookConfig["onError"];

  formatErrorResponse: WebhookConfig["formatErrorResponse"];

  protected constructor(configuration: WebhookConfig, protected adapter: PlatformAdapterInterface<Request>, protected adapterMiddleware: PlatformAdapterMiddleware<Request>) {
    const {
      name,
      webhookPath,
      event,
      query,
      apl,
      isActive = true,
      subscriptionQueryAst,
    } = configuration;

    this.name = name || `${event} webhook`;
    /**
     * Fallback subscriptionQueryAst to avoid breaking changes
     *
     * TODO Remove in 0.35.0
     */
    this.query = query ?? subscriptionQueryAst;
    this.webhookPath = webhookPath;
    this.event = event;
    this.isActive = isActive;
    this.apl = apl;
    this.onError = configuration.onError;
    this.formatErrorResponse = configuration.formatErrorResponse;
  }

  private getTargetUrl(baseUrl: string) {
    return new URL(this.webhookPath, baseUrl).href;
  }

  /**
   * Returns synchronous event manifest for this webhook.
   *
   * @param baseUrl Base URL used by your application
   * @returns WebhookManifest
   */
  protected getWebhookManifestBase(baseUrl: string): WebhookManifest {
    return {
      query: typeof this.query === "string" ? this.query : gqlAstToString(this.query),
      name: this.name,
      targetUrl: this.getTargetUrl(baseUrl),
      isActive: this.isActive,
    };
  }

  abstract getWebhookManifest(baseUrl: string): WebhookManifest;

  abstract createHandler(handlerFn: Fn): Fn;

  protected processWebhookRequest<T>({ allowedEvent }: { allowedEvent: string }): Promise<WebhookContext<T>> {
    const tracer = getOtelTracer();

    return tracer.startActiveSpan(
      "processSaleorWebhook",
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          allowedEvent,
        },
      },
      async (span) => {
        try {
          debug("Request processing started");

          if (this.adapter.method !== "POST") {
            debug("Wrong HTTP method");
            throw new WebhookError("Wrong request method, only POST allowed", "WRONG_METHOD");
          }

          const { event, signature, saleorApiUrl } = this.adapterMiddleware.getSaleorHeaders();
          const baseUrl = this.adapter.getBaseUrl();

          if (!baseUrl) {
            debug("Missing host header");
            throw new WebhookError("Missing host header", "MISSING_HOST_HEADER");
          }

          if (!saleorApiUrl) {
            debug("Missing saleor-api-url header");
            throw new WebhookError("Missing saleor-api-url header", "MISSING_API_URL_HEADER");
          }

          if (!event) {
            debug("Missing saleor-event header");
            throw new WebhookError("Missing saleor-event header", "MISSING_EVENT_HEADER");
          }

          const expected = allowedEvent.toLowerCase();

          if (event !== expected) {
            debug(`Wrong incoming request event: ${event}. Expected: ${expected}`);

            throw new WebhookError(
              `Wrong incoming request event: ${event}. Expected: ${expected}`,
              "WRONG_EVENT"
            );
          }

          if (!signature) {
            debug("No signature");

            throw new WebhookError("Missing saleor-signature header", "MISSING_SIGNATURE_HEADER");
          }

          const rawBody = await this.adapter.getRawBody();

          if (!rawBody) {
            debug("Missing request body");

            throw new WebhookError("Missing request body", "MISSING_REQUEST_BODY");
          }

          let parsedBody: unknown & { version?: string | null };

          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            debug("Request body cannot be parsed");

            throw new WebhookError("Request body can't be parsed", "CANT_BE_PARSED");
          }

          let parsedSchemaVersion: number | null = null;

          try {
            parsedSchemaVersion = parseSchemaVersion(parsedBody.version);
          } catch {
            debug("Schema version cannot be parsed");
          }

          /**
           * Verify if the app is properly installed for given Saleor API URL
           */
          const authData = await this.apl.get(saleorApiUrl);

          if (!authData) {
            debug("APL didn't found auth data for %s", saleorApiUrl);

            throw new WebhookError(
              `Can't find auth data for ${saleorApiUrl}. Please register the application`,
              "NOT_REGISTERED"
            );
          }

          /**
           * Verify payload signature
           *
           * TODO: Add test for repeat verification scenario
           */
          try {
            debug("Will verify signature with JWKS saved in AuthData");

            if (!authData.jwks) {
              throw new Error("JWKS not found in AuthData");
            }

            await verifySignatureWithJwks(authData.jwks, signature, rawBody);
          } catch {
            debug("Request signature check failed. Refresh the JWKS cache and check again");

            const newJwks = await fetchRemoteJwks(authData.saleorApiUrl).catch((e) => {
              debug(e);

              throw new WebhookError("Fetching remote JWKS failed", "SIGNATURE_VERIFICATION_FAILED");
            });

            debug("Fetched refreshed JWKS");

            try {
              debug("Second attempt to validate the signature JWKS, using fresh tokens from the API");

              await verifySignatureWithJwks(newJwks, signature, rawBody);

              debug("Verification successful - update JWKS in the AuthData");

              await this.apl.set({ ...authData, jwks: newJwks });
            } catch {
              debug("Second attempt also ended with validation error. Reject the webhook");

              throw new WebhookError(
                "Request signature check failed",
                "SIGNATURE_VERIFICATION_FAILED"
              );
            }
          }

          span.setStatus({
            code: SpanStatusCode.OK,
          });

          return {
            baseUrl,
            event,
            payload: parsedBody as T,
            authData,
            schemaVersion: parsedSchemaVersion,
          };
        } catch (err) {
          const message = (err as Error)?.message ?? "Unknown error";

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message,
          });

          throw err;
        } finally {
          span.end();
        }
      }
    );
  }

  protected getDefaultErrorResponse(error: WebhookError | Error): ActionHandlerResult {
    if (error instanceof WebhookError) {
      const status = WebhookErrorCodeMap[error.errorType] || 400;
      return {
        body: {
          type: error.errorType,
          message: error.message
        },
        status,
        bodyType: "json"
      };
    }

    return {
      body: "Unexpected server error",
      bodyType: "string",
      status: 500
    }
  };

}
