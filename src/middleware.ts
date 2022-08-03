import crypto from "crypto";
import * as jose from "jose";
import jwt, { JwtPayload } from "jsonwebtoken";
import jwks, { CertSigningKey, RsaSigningKey } from "jwks-rsa";
import type { Middleware, Request } from "retes";
import { Response } from "retes/response";

import { SALEOR_DOMAIN_HEADER, SALEOR_EVENT_HEADER } from "./const";
import { jwksUrl } from "./urls";

export const withBaseURL: Middleware = (handler) => async (request) => {
  const { host, "x-forwarded-proto": protocol = "http" } = request.headers;

  request.context.baseURL = `${protocol}://${host}`;

  const response = await handler(request);
  return response;
};

export const withSaleorDomainPresent: Middleware = (handler) => async (request) => {
  const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER];

  if (!saleorDomain) {
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
    if (request.rawBody === undefined) {
      return Response.InternalServerError({
        success: false,
        message: "Request payload already parsed.",
      });
    }

    const { [SALEOR_DOMAIN_HEADER]: saleorDomain, "saleor-signature": payloadSignature } =
      request.headers;

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
          message: "Invalid signature.",
        });
      }
    }

    return handler(request);
  };

export interface DashboardTokenPayload extends JwtPayload {
  app: string;
}

export const withJWTVerified =
  (getAppId: (request: Request) => Promise<string | undefined>): Middleware =>
  (handler) =>
  async (request) => {
    const { [SALEOR_DOMAIN_HEADER]: saleorDomain, "authorization-bearer": token } = request.headers;

    if (token === undefined) {
      return Response.BadRequest({
        success: false,
        message: "Missing token.",
      });
    }

    let tokenClaims;
    try {
      tokenClaims = jwt.decode(token as string);
    } catch (e) {
      console.error(e);
      return Response.BadRequest({
        success: false,
        message: "Invalid token.",
      });
    }

    if (tokenClaims === null) {
      return Response.BadRequest({
        success: false,
        message: "Invalid token.",
      });
    }

    if ((tokenClaims as DashboardTokenPayload).iss !== saleorDomain) {
      return Response.BadRequest({
        success: false,
        message: "Invalid token.",
      });
    }

    let appId: string | undefined;
    try {
      appId = await getAppId(request);
    } catch (error) {
      console.error("Error during getting the app ID.");
      console.error(error);
      return Response.BadRequest({
        success: false,
        message: "Error during token invalidation - could not obtain the app ID.",
      });
    }

    if (!appId || (tokenClaims as DashboardTokenPayload).app !== appId) {
      return Response.BadRequest({
        success: false,
        message: "Invalid token.",
      });
    }

    const jwksClient = jwks({
      jwksUri: `https://${saleorDomain}/.well-known/jwks.json`,
    });
    const signingKey = await jwksClient.getSigningKey();
    const signingSecret =
      (signingKey as CertSigningKey).publicKey || (signingKey as RsaSigningKey).rsaPublicKey;

    try {
      jwt.verify(token as string, signingSecret);
    } catch (e) {
      console.error(e);
      return Response.BadRequest({
        success: false,
        message: "Invalid token.",
      });
    }

    return handler(request);
  };
