import { SpanKind, SpanStatusCode } from "@opentelemetry/api";

import { APL } from "@/APL";
import { fetchRemoteJwks } from "@/auth/fetch-remote-jwks";
import { createDebug } from "@/debug";
import { getOtelTracer } from "@/open-telemetry";
import { SaleorSchemaVersion } from "@/types";
import { parseSchemaVersion } from "@/util/schema-version";

import { verifySignatureWithJwks } from "../../auth/verify-signature";
import { PlatformAdapterInterface } from "./generic-adapter-use-case-types";
import { SaleorRequestProcessor } from "./saleor-request-processor";
import { WebhookContext, WebhookError } from "./saleor-webhook";

type WebhookValidationResult<TPayload> =
  | { result: "ok"; context: WebhookContext<TPayload> }
  | { result: "failure"; error: WebhookError | Error };

export class SaleorWebhookValidator {
  private verifySignatureWithJwks = verifySignatureWithJwks.bind(this);

  constructor(params?: { verifySignatureFn: typeof verifySignatureWithJwks }) {
    if (params?.verifySignatureFn) {
      this.verifySignatureWithJwks = params.verifySignatureFn;
    }
  }

  private debug = createDebug("processProtectedHandler");

  private tracer = getOtelTracer();

  async validateRequest<TPayload, TRequestType>(config: {
    allowedEvent: string;
    apl: APL;
    adapter: PlatformAdapterInterface<TRequestType>;
    requestProcessor: SaleorRequestProcessor<TRequestType>;
  }): Promise<WebhookValidationResult<TPayload>> {
    try {
      const context = await this.validateRequestOrThrowError<TPayload, TRequestType>(config);

      return {
        result: "ok",
        context,
      };
    } catch (err) {
      return {
        result: "failure",
        error: err as WebhookError | Error,
      };
    }
  }

  private async validateRequestOrThrowError<TPayload, TRequestType>({
    allowedEvent,
    apl,
    adapter,
    requestProcessor,
  }: {
    allowedEvent: string;
    apl: APL;
    adapter: PlatformAdapterInterface<TRequestType>;
    requestProcessor: SaleorRequestProcessor<TRequestType>;
  }): Promise<WebhookContext<TPayload>> {
    return this.tracer.startActiveSpan(
      "processSaleorWebhook",
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          allowedEvent,
        },
      },
      async (span) => {
        try {
          this.debug("Request processing started");

          if (adapter.method !== "POST") {
            this.debug("Wrong HTTP method");
            throw new WebhookError("Wrong request method, only POST allowed", "WRONG_METHOD");
          }

          const { event, signature, saleorApiUrl } = requestProcessor.getSaleorHeaders();
          const baseUrl = adapter.getBaseUrl();

          if (!baseUrl) {
            this.debug("Missing host header");
            throw new WebhookError("Missing host header", "MISSING_HOST_HEADER");
          }

          if (!saleorApiUrl) {
            this.debug("Missing saleor-api-url header");
            throw new WebhookError("Missing saleor-api-url header", "MISSING_API_URL_HEADER");
          }

          if (!event) {
            this.debug("Missing saleor-event header");
            throw new WebhookError("Missing saleor-event header", "MISSING_EVENT_HEADER");
          }

          const expected = allowedEvent.toLowerCase();

          if (event !== expected) {
            this.debug(`Wrong incoming request event: ${event}. Expected: ${expected}`);

            throw new WebhookError(
              `Wrong incoming request event: ${event}. Expected: ${expected}`,
              "WRONG_EVENT",
            );
          }

          if (!signature) {
            this.debug("No signature");

            throw new WebhookError("Missing saleor-signature header", "MISSING_SIGNATURE_HEADER");
          }

          const rawBody = await adapter.getRawBody();
          if (!rawBody) {
            this.debug("Missing request body");

            throw new WebhookError("Missing request body", "MISSING_REQUEST_BODY");
          }

          let parsedBody: unknown & { version?: string | null };

          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            this.debug("Request body cannot be parsed");

            throw new WebhookError("Request body can't be parsed", "CANT_BE_PARSED");
          }

          /**
           * Can be undefined - subscription must contain "version", otherwise nothing to parse
           */
          let parsedSchemaVersion: SaleorSchemaVersion | null = null;

          try {
            parsedSchemaVersion = parseSchemaVersion(parsedBody.version);
          } catch {
            this.debug("Schema version cannot be parsed");
          }

          /**
           * Verify if the app is properly installed for given Saleor API URL
           */
          const authData = await apl.get(saleorApiUrl);

          if (!authData) {
            this.debug("APL didn't found auth data for %s", saleorApiUrl);

            throw new WebhookError(
              `Can't find auth data for ${saleorApiUrl}. Please register the application`,
              "NOT_REGISTERED",
            );
          }

          /**
           * Verify payload signature
           */
          try {
            this.debug("Will verify signature with JWKS saved in AuthData");

            if (!authData.jwks) {
              throw new Error("JWKS not found in AuthData");
            }

            await this.verifySignatureWithJwks(authData.jwks, signature, rawBody);
          } catch {
            this.debug("Request signature check failed. Refresh the JWKS cache and check again");

            const newJwks = await fetchRemoteJwks(authData.saleorApiUrl).catch((e) => {
              this.debug(e);

              throw new WebhookError(
                "Fetching remote JWKS failed",
                "SIGNATURE_VERIFICATION_FAILED",
              );
            });

            this.debug("Fetched refreshed JWKS");

            try {
              this.debug(
                "Second attempt to validate the signature JWKS, using fresh tokens from the API",
              );

              await this.verifySignatureWithJwks(newJwks, signature, rawBody);

              this.debug("Verification successful - update JWKS in the AuthData");

              await apl.set({ ...authData, jwks: newJwks });
            } catch {
              this.debug("Second attempt also ended with validation error. Reject the webhook");

              throw new WebhookError(
                "Request signature check failed",
                "SIGNATURE_VERIFICATION_FAILED",
              );
            }
          }

          span.setStatus({
            code: SpanStatusCode.OK,
          });

          return {
            baseUrl,
            event,
            payload: parsedBody as TPayload,
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
      },
    );
  }
}
