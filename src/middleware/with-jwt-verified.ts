import * as jose from "jose";
import type { Middleware, Request } from "retes";
import { Response } from "retes/response";

import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "../const";
import { getSaleorHeaders } from "../headers";
import { getJwksUrl } from "../urls";
import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withJWTVerified");

export interface DashboardTokenPayload extends jose.JWTPayload {
  app: string;
}

const ERROR_MESSAGE = "JWT verification failed:";

export const withJWTVerified =
  (getAppId: (request: Request) => Promise<string | undefined>): Middleware =>
  (handler) =>
  async (request) => {
    const { domain, authorizationBearer: token } = getSaleorHeaders(request.headers);

    debug("Middleware called with domain: \"%s\"", domain);

    if (typeof token !== "string") {
      debug("Middleware with empty token, will response with Bad Request", token);

      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Missing ${SALEOR_AUTHORIZATION_BEARER_HEADER} header.`,
      });
    }

    debug("Middleware called with token starting with: \"%s\"", token.substring(0, 4));

    if (domain === undefined) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Missing ${SALEOR_DOMAIN_HEADER} header.`,
      });
    }

    let tokenClaims: DashboardTokenPayload;

    try {
      tokenClaims = jose.decodeJwt(token as string) as DashboardTokenPayload;
      debug("Token Claims decoded from jwt");
    } catch (e) {
      debug("Token Claims could not be decoded from JWT, will respond with Bad Request");

      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Could not decode authorization token.`,
      });
    }

    if (tokenClaims.iss !== domain) {
      debug("Token iss doesn't match domain, will response with Bad Request");

      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Token iss property is different than domain header.`,
      });
    }

    let appId: string | undefined;

    try {
      appId = await getAppId(request);

      debug("Resolved App ID from request to be: %s", appId);
    } catch (error) {
      debug("App ID could not be resolved from request, will respond with Internal Server Error");

      return Response.InternalServerError({
        success: false,
        message: `${ERROR_MESSAGE} Could not obtain the app ID.`,
      });
    }

    if (!appId) {
      debug("Resolved App ID to be empty value");

      return Response.InternalServerError({
        success: false,
        message: `${ERROR_MESSAGE} No value for app ID.`,
      });
    }

    if (tokenClaims.app !== appId) {
      debug(
        "Resolved App ID value from token to be different than in request, will respond with Bad Request"
      );

      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Token's app property is different than app ID.`,
      });
    }

    try {
      debug("Trying to create JWKS");

      const JWKS = jose.createRemoteJWKSet(new URL(getJwksUrl(domain)));
      debug("Trying to compare JWKS with token");
      await jose.jwtVerify(token, JWKS);
    } catch (e) {
      debug("Failure: %s", e);
      debug("Will return with Bad Request");

      console.error(e);

      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} JWT signature verification failed.`,
      });
    }

    return handler(request);
  };
