import * as jose from "jose";

import { getJwksUrlFromSaleorApiUrl } from "@/auth/index";

import { createDebug } from "../debug";
import { Permission } from "../types";
import { getJoseErrorReason } from "./get-jose-error-reason";
import { hasPermissionsInJwtToken } from "./has-permissions-in-jwt-token";
import { verifyTokenExpiration } from "./verify-token-expiration";

const debug = createDebug("verify-jwt");

/**
 * Format a unix-seconds timestamp (as found in JWT exp/iat claims) for logging.
 * Returns the human-readable ISO date alongside the raw value so logs are unambiguous.
 */
const formatJwtTimestamp = (timestampInSeconds: number | undefined) => {
  if (typeof timestampInSeconds !== "number") {
    return "missing";
  }

  return `${new Date(timestampInSeconds * 1000).toISOString()} (${timestampInSeconds})`;
};

export interface DashboardTokenPayload extends jose.JWTPayload {
  app: string;
  user_permissions: Permission[];
}

export interface verifyJWTArguments {
  appId: string;
  saleorApiUrl: string;
  token: string;
  requiredPermissions?: Permission[];
}

export const verifyJWT = async ({
  saleorApiUrl,
  token,
  appId,
  requiredPermissions,
}: verifyJWTArguments) => {
  let tokenClaims: DashboardTokenPayload;
  const ERROR_MESSAGE = "JWT verification failed:";

  try {
    tokenClaims = jose.decodeJwt(token as string) as DashboardTokenPayload;
    debug("Token Claims decoded from jwt");
    debug(
      "Token timing - now: %s, exp: %s, iat: %s",
      new Date().toISOString(),
      formatJwtTimestamp(tokenClaims.exp),
      formatJwtTimestamp(tokenClaims.iat),
    );
  } catch (e) {
    debug("Token Claims could not be decoded from JWT, will respond with Bad Request");
    throw new Error(`${ERROR_MESSAGE} Could not decode authorization token.`, {
      cause: e,
    });
  }

  try {
    verifyTokenExpiration(tokenClaims);
  } catch (e) {
    throw new Error(`${ERROR_MESSAGE} ${(e as Error).message}`, {
      cause: e,
    });
  }

  if (tokenClaims.app !== appId) {
    debug(
      "Resolved App ID value from token to be different than in request, will respond with Bad Request",
    );

    throw new Error(`${ERROR_MESSAGE} Token's app property is different than app ID.`);
  }

  if (!hasPermissionsInJwtToken(tokenClaims, requiredPermissions)) {
    debug("Token did not meet requirements for permissions: %s", requiredPermissions);
    throw new Error(`${ERROR_MESSAGE} Token's permissions are not sufficient.`);
  }

  try {
    debug("Trying to create JWKS");

    const JWKS = jose.createRemoteJWKSet(new URL(getJwksUrlFromSaleorApiUrl(saleorApiUrl)));
    debug("Trying to compare JWKS with token");
    await jose.jwtVerify(token, JWKS);
  } catch (e) {
    const reason = getJoseErrorReason(e);

    debug("Failure: %s", e);
    debug("Will return with Bad Request");

    console.error(e);

    /**
     * Append the specific jose reason (e.g. ERR_JWKS_NO_MATCHING_KEY,
     * ERR_JWS_SIGNATURE_VERIFICATION_FAILED, ERR_JWT_EXPIRED) and the token's
     * expiry, so the actual cause of the failure can be diagnosed from the message.
     */
    throw new Error(
      `${ERROR_MESSAGE} JWT signature verification failed. Reason: ${reason}. Token exp: ${formatJwtTimestamp(
        tokenClaims.exp,
      )}.`,
      {
        cause: e,
      },
    );
  }
};
