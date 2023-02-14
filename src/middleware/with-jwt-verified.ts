import * as jose from "jose";
import type { Middleware, Request } from "retes";
import { Response } from "retes/response";

import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "../const";
import { getSaleorHeaders } from "../headers";
import { getJwksUrlFromSaleorApiUrl } from "../urls";
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
    const { authorizationBearer: token, saleorApiUrl } = getSaleorHeaders(request.headers);

    debug("Middleware called with apiUrl: \"%s\"", saleorApiUrl);

    if (typeof token !== "string") {
      debug("Middleware with empty token, will response with Bad Request", token);

      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Missing ${SALEOR_AUTHORIZATION_BEARER_HEADER} header.`,
      });
    }

    debug("Middleware called with token starting with: \"%s\"", token.substring(0, 4));

    if (saleorApiUrl === undefined) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Missing ${SALEOR_API_URL_HEADER} header.`,
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

      const JWKS = jose.createRemoteJWKSet(new URL(getJwksUrlFromSaleorApiUrl(saleorApiUrl)));
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
