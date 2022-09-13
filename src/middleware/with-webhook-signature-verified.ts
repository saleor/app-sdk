import crypto from "crypto";
import * as jose from "jose";
import { Middleware } from "retes";
import { Response } from "retes/response";

import { SALEOR_DOMAIN_HEADER, SALEOR_SIGNATURE_HEADER } from "../const";
import { getSaleorHeaders } from "../headers";
import { getJwksUrl } from "../urls";
import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withWebhookSignatureVerified");

const ERROR_MESSAGE = "Webhook signature verification failed:";

export const withWebhookSignatureVerified =
  (secretKey: string | undefined = undefined): Middleware =>
  (handler) =>
  async (request) => {
    debug("Middleware executing start");

    if (request.rawBody === undefined) {
      debug("Request rawBody was not found, will return Internal Server Error");

      return Response.InternalServerError({
        success: false,
        error: {
          message: `${ERROR_MESSAGE} Request payload already parsed.`,
        },
      });
    }

    const { domain: saleorDomain, signature: payloadSignature } = getSaleorHeaders(request.headers);

    if (!payloadSignature) {
      debug("Signature header was not found");

      return Response.BadRequest({
        success: false,
        error: {
          message: `${ERROR_MESSAGE} Missing ${SALEOR_SIGNATURE_HEADER} header.`,
        },
      });
    }

    if (!saleorDomain) {
      return Response.BadRequest({
        success: false,
        error: {
          message: `${ERROR_MESSAGE} Missing ${SALEOR_DOMAIN_HEADER} header.`,
        },
      });
    }

    if (secretKey !== undefined) {
      const calculatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(request.rawBody)
        .digest("hex");

      debug("Signature was calculated");

      if (calculatedSignature !== payloadSignature) {
        debug("Calculated signature doesn't match payload signature, will return Bad Request");

        return Response.BadRequest({
          success: false,
          error: {
            message: `${ERROR_MESSAGE} Verification using secret key has failed.`,
          },
        });
      }
    } else {
      const [header, , signature] = payloadSignature.split(".");
      const jws = {
        protected: header,
        payload: request.rawBody,
        signature,
      };

      const remoteJwks = jose.createRemoteJWKSet(
        new URL(getJwksUrl(saleorDomain))
      ) as jose.FlattenedVerifyGetKey;

      debug("Created remote JWKS");

      try {
        await jose.flattenedVerify(jws, remoteJwks);

        debug("JWKS verified");
      } catch {
        debug("JWKS verification failed");

        return Response.BadRequest({
          success: false,
          error: {
            message: `${ERROR_MESSAGE} Verification using public key has failed.`,
          },
        });
      }
    }

    return handler(request);
  };
