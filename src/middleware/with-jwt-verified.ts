import * as jose from "jose";
import type { Middleware, Request } from "retes";
import { Response } from "retes/response";

import { SALEOR_AUTHORIZATION_BEARER_HEADER } from "../const";
import { getSaleorHeaders } from "../headers";
import { getJwksUrl } from "../urls";

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
      const JWKS = jose.createRemoteJWKSet(new URL(getJwksUrl(domain)));
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
