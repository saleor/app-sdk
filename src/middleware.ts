import crypto from "crypto";
import * as jose from "jose";
import type { Middleware, Request } from "retes";
import { Response } from "retes/response";

import { SALEOR_AUTHORIZATION_BEARER_HEADER } from "./const";
import { getSaleorHeaders } from "./headers";
import { jwksUrl } from "./urls";

export const withBaseURL: Middleware = (handler) => async (request) => {
  const { host, "x-forwarded-proto": protocol = "http" } = request.headers;

  request.context.baseURL = `${protocol}://${host}`;

  const response = await handler(request);
  return response;
};

export const withSaleorDomainPresent: Middleware = (handler) => async (request) => {
  const { domain } = getSaleorHeaders(request.headers);

  if (!domain) {
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
    const { event } = getSaleorHeaders(request.headers);

    if (event !== expectedEvent) {
      return Response.BadRequest({
        success: false,
        message: `Invalid Saleor event. Expecting ${expectedEvent}.`,
      });
    }

    return handler(request);
  };

export const withAuthTokenRequired: Middleware = (handler) => async (request) => {
  const authToken = request.params.auth_token;
  if (!authToken) {
    return Response.BadRequest({
      success: false,
      message: "Missing auth token.",
    });
  }

  return handler(request);
};

export const withWebhookSignatureVerified =
  (secretKey: string | undefined = undefined): Middleware =>
  (handler) =>
  async (request) => {
    const ERROR_MESSAGE = "Webhook signature verification failed:";

    if (request.rawBody === undefined) {
      return Response.InternalServerError({
        success: false,
        message: `${ERROR_MESSAGE} Request payload already parsed.`,
      });
    }

    const { domain: saleorDomain, signature: payloadSignature } = getSaleorHeaders(request.headers);

    if (!payloadSignature) {
      return Response.BadRequest({
        success: false,
        message: "Missing payload signature.",
      });
    }

    if (secretKey !== undefined) {
      const calculatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(request.rawBody)
        .digest("hex");

      if (calculatedSignature !== payloadSignature) {
        return Response.BadRequest({
          success: false,
          message: `${ERROR_MESSAGE} Verification using secret key has failed.`,
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
        new URL(jwksUrl(saleorDomain))
      ) as jose.FlattenedVerifyGetKey;

      try {
        await jose.flattenedVerify(jws, remoteJwks);
      } catch {
        return Response.BadRequest({
          success: false,
          message: `${ERROR_MESSAGE} Verification using public key has failed.`,
        });
      }
    }

    return handler(request);
  };

export interface DashboardTokenPayload extends jose.JWTPayload {
  app: string;
}

export const withJWTVerified =
  (getAppId: (request: Request) => Promise<string | undefined>): Middleware =>
  (handler) =>
  async (request) => {
    const { domain, authorizationBearer: token } = getSaleorHeaders(request.headers);
    const ERROR_MESSAGE = "JWT verification failed:";

    if (token === undefined) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Missing ${SALEOR_AUTHORIZATION_BEARER_HEADER} header.`,
      });
    }

    let tokenClaims: DashboardTokenPayload;
    try {
      tokenClaims = jose.decodeJwt(token as string) as DashboardTokenPayload;
    } catch (e) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Could not decode authorization token.`,
      });
    }

    if (tokenClaims.iss !== domain) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Token iss property is different than domain header.`,
      });
    }

    let appId: string | undefined;
    try {
      appId = await getAppId(request);
    } catch (error) {
      return Response.InternalServerError({
        success: false,
        message: `${ERROR_MESSAGE} Could not obtain the app ID.`,
      });
    }

    if (!appId) {
      return Response.InternalServerError({
        success: false,
        message: `${ERROR_MESSAGE} No value for app ID.`,
      });
    }

    if (tokenClaims.app !== appId) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Token's app property is different than app ID.`,
      });
    }

    try {
      const JWKS = jose.createRemoteJWKSet(new URL(jwksUrl(domain)));
      await jose.jwtVerify(token, JWKS);
    } catch (e) {
      console.error(e);
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} JWT signature verification failed.`,
      });
    }

    return handler(request);
  };
