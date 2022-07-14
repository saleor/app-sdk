import crypto from "crypto";

import * as jose from "jose";
import type { Middleware } from "retes";
import { Response } from "retes/response";

import { SALEOR_DOMAIN_HEADER, SALEOR_EVENT_HEADER } from "./const";
import { jwksUrl } from "./urls";

export const withBaseURL: Middleware = (handler) => async (request) => {
  const { host, "x-forwarded-proto": protocol = "http" } = request.headers;

  request.context.baseURL = `${protocol}://${host}`;

  const response = await handler(request);
  return response;
};

export const withSaleorDomainPresent: Middleware =
  (handler) => async (request) => {
    const saleor_domain = request.headers[SALEOR_DOMAIN_HEADER];

    if (!saleor_domain) {
      return Response.BadRequest({
        success: false,
        message: "Missing Saleor domain header.",
      });
    }

    return handler(request);
  };

export const withSaleorEventMatch =
  <E extends string>(expectedEvent: `${Lowercase<E>}`): Middleware =>
  (handler) =>
  async (request) => {
    const receivedEvent = request.headers[SALEOR_EVENT_HEADER];

    if (receivedEvent !== expectedEvent) {
      return Response.BadRequest({
        success: false,
        message: "Invalid Saleor Event",
      });
    }

    return handler(request);
  };

export const withAuthTokenRequired: Middleware =
  (handler) => async (request) => {
    const auth_token = request.params.auth_token;
    if (!auth_token) {
      return Response.BadRequest({
        success: false,
        message: "Missing auth token.",
      });
    }

    return handler(request);
  };

export const withWebhookSignatureVerified = (
  secretKey: string | undefined = undefined
): Middleware => {
  return (handler) => async (request) => {
    if (request.rawBody === undefined) {
      return Response.InternalServerError({
        success: false,
        message: "Request payload already parsed.",
      });
    }

    const {
      [SALEOR_DOMAIN_HEADER]: saleorDomain,
      "saleor-signature": payloadSignature,
    } = request.headers;

    if (secretKey !== undefined) {
      const calculatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(request.rawBody)
        .digest("hex");

      if (calculatedSignature !== payloadSignature) {
        return Response.BadRequest({
          success: false,
          message: "Invalid signature.",
        });
      }
    } else {
      const [header, _, signature] = payloadSignature.split(".");
      const jws = {
        protected: header,
        payload: request.rawBody,
        signature,
      };

      const jwks = jose.createRemoteJWKSet(
        new URL(jwksUrl(saleorDomain))
      ) as jose.FlattenedVerifyGetKey;

      try {
        await jose.flattenedVerify(jws, jwks);
      } catch {
        return Response.BadRequest({
          success: false,
          message: "Invalid signature.",
        });
      }
    }

    return handler(request);
  };
};
