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
  /**
   * JWKS stored in the APL (`AuthData.jwks`). When given, the token is checked against it first,
   * without a network call. Saleor's remote JWKS is used only if that check fails, e.g. after a key rotation.
   */
  jwks?: string;
}

/**
 * One remote key set per JWKS URL, so jose's cache (10 min, refetch on an unknown key ID,
 * one fetch shared by concurrent calls) lives across requests instead of being rebuilt on every call.
 */
const remoteJwksByUrl = new Map<string, ReturnType<typeof jose.createRemoteJWKSet>>();

const getRemoteJwks = (saleorApiUrl: string) => {
  const url = getJwksUrlFromSaleorApiUrl(saleorApiUrl);
  let jwks = remoteJwksByUrl.get(url);

  if (!jwks) {
    jwks = jose.createRemoteJWKSet(new URL(url));
    remoteJwksByUrl.set(url, jwks);
  }

  return jwks;
};

const verifyWithStoredJwks = async (token: string, jwks: string) => {
  try {
    await jose.jwtVerify(token, jose.createLocalJWKSet(JSON.parse(jwks)));

    return true;
  } catch (e) {
    debug(
      "Stored JWKS did not verify the token (%s), will use the remote JWKS",
      getJoseErrorReason(e),
    );

    return false;
  }
};

export const verifyJWT = async ({
  saleorApiUrl,
  token,
  appId,
  requiredPermissions,
  jwks,
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

  if (jwks && (await verifyWithStoredJwks(token, jwks))) {
    debug("Token verified with the stored JWKS");

    return;
  }

  try {
    debug("Trying to compare remote JWKS with token");
    await jose.jwtVerify(token, getRemoteJwks(saleorApiUrl));
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
