import * as jose from "jose";

import { createDebug } from "../debug";
import { getJoseErrorReason } from "./get-jose-error-reason";

const debug = createDebug("verify-signature");

/**
 * Verify the Webhook payload signature from provided JWKS string.
 * JWKS can be cached to avoid unnecessary calls.
 */
export const verifySignatureWithJwks = async (jwks: string, signature: string, rawBody: string) => {
  const [header, , jwsSignature] = signature.split(".");
  const jws: jose.FlattenedJWSInput = {
    protected: header,
    payload: rawBody,
    signature: jwsSignature,
  };

  let localJwks: jose.FlattenedVerifyGetKey;

  try {
    const parsedJWKS = JSON.parse(jwks);

    localJwks = jose.createLocalJWKSet(parsedJWKS) as jose.FlattenedVerifyGetKey;
  } catch (e) {
    const reason = getJoseErrorReason(e);

    debug("Could not create local JWKSSet from given data: %s, reason: %s", jwks, reason);

    throw new Error(`JWKS verification failed - could not parse given JWKS. Reason: ${reason}`, {
      cause: e,
    });
  }

  try {
    await jose.flattenedVerify(jws, localJwks);
    debug("JWKS verified");
  } catch (e) {
    const reason = getJoseErrorReason(e);

    debug("JWKS verification failed, reason: %s", reason);

    throw new Error(`JWKS verification failed. Reason: ${reason}`, {
      cause: e,
    });
  }
};

export const getJwksUrlFromSaleorApiUrl = (saleorApiUrl: string): string =>
  `${new URL(saleorApiUrl).origin}/.well-known/jwks.json`;
