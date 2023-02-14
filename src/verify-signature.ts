import * as jose from "jose";

import { createDebug } from "./debug";
import { getJwksUrlFromSaleorApiUrl } from "./urls";

const debug = createDebug("verify-signature");

/**
 * Verify Webhook payload signature with public key of given `domain`
 * https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks#payload-signature
 *
 * Use Saleor URL to fetch JWKS
 *
 * TODO: Add test
 */
export const verifySignatureFromApiUrl = async (
  saleorApiUrl: string,
  signature: string,
  rawBody: string
) => {
  const [header, , jwsSignature] = signature.split(".");
  const jws: jose.FlattenedJWSInput = {
    protected: header,
    payload: rawBody,
    signature: jwsSignature,
  };

  const remoteJwks = jose.createRemoteJWKSet(
    new URL(getJwksUrlFromSaleorApiUrl(saleorApiUrl))
  ) as jose.FlattenedVerifyGetKey;

  debug("Created remote JWKS");

  try {
    await jose.flattenedVerify(jws, remoteJwks);
    debug("JWKS verified");
  } catch {
    debug("JWKS verification failed");
    throw new Error("JWKS verification failed");
  }
};

/**
 * Verify the Webhook payload signature from provided JWKS string.
 * JWKS can be cached to avoid unnecessary calls.
 *
 * TODO: Add test
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
  } catch {
    debug("Could not create local JWKSSet from given data: %s", jwks);
    throw new Error("JWKS verification failed - could not parse given JWKS");
  }

  debug("Created remote JWKS");

  try {
    await jose.flattenedVerify(jws, localJwks);
    debug("JWKS verified");
  } catch {
    debug("JWKS verification failed");
    throw new Error("JWKS verification failed");
  }
};
