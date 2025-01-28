import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { NextApiRequest } from "next";
import getRawBody from "raw-body";

import { APL } from "../../../APL";
import { AuthData } from "../../../APL/apl";
import { createDebug } from "../../../debug";
import { fetchRemoteJwks } from "../../../fetch-remote-jwks";
import { getBaseUrl, getSaleorHeaders } from "../../../headers";
import { getOtelTracer } from "../../../open-telemetry";
import { parseSchemaVersion } from "../../../util";
import { verifySignatureWithJwks } from "../../../verify-signature";

const debug = createDebug("processSaleorWebhook");

export type SaleorWebhookError =
  | "OTHER"
  | "MISSING_HOST_HEADER"
  | "MISSING_DOMAIN_HEADER"
  | "MISSING_API_URL_HEADER"
  | "MISSING_EVENT_HEADER"
  | "MISSING_PAYLOAD_HEADER"
  | "MISSING_SIGNATURE_HEADER"
  | "MISSING_REQUEST_BODY"
  | "WRONG_EVENT"
  | "NOT_REGISTERED"
  | "SIGNATURE_VERIFICATION_FAILED"
  | "WRONG_METHOD"
  | "CANT_BE_PARSED"
  | "CONFIGURATION_ERROR";

export class WebhookError extends Error {
  errorType: SaleorWebhookError = "OTHER";

  constructor(message: string, errorType: SaleorWebhookError) {
    super(message);
    if (errorType) {
      this.errorType = errorType;
    }
    Object.setPrototypeOf(this, WebhookError.prototype);
  }
}

export type WebhookContext<T> = {
  baseUrl: string;
  event: string;
  payload: T;
  authData: AuthData;
  /** For Saleor < 3.15 it will be null. */
  schemaVersion: number | null;
};

interface ProcessSaleorWebhookArgs {
  req: NextApiRequest;
  apl: APL;
  allowedEvent: string;
}

type ProcessSaleorWebhook = <T = unknown>(
  props: ProcessSaleorWebhookArgs
) => Promise<WebhookContext<T>>;

/**
 * Perform security checks on given request and return WebhookContext object.
 * In case of validation issues, instance of the WebhookError will be thrown.
 *
 * @returns WebhookContext
 */
export const processSaleorWebhook: ProcessSaleorWebhook = async <T>({
  req,
  apl,
  allowedEvent,
}: ProcessSaleorWebhookArgs): Promise<WebhookContext<T>> => {
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

        if (req.method !== "POST") {
          debug("Wrong HTTP method");
          throw new WebhookError("Wrong request method, only POST allowed", "WRONG_METHOD");
        }

        const { event, signature, saleorApiUrl } = getSaleorHeaders(req.headers);
        const baseUrl = getBaseUrl(req.headers);

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

        const rawBody = (
          await getRawBody(req, {
            length: req.headers["content-length"],
          })
        ).toString();
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
        const authData = await apl.get(saleorApiUrl);

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

            await apl.set({ ...authData, jwks: newJwks });
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
};
