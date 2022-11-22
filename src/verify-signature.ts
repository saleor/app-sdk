import * as jose from "jose";

import { createDebug } from "./debug";
import { getJwksUrl, getJwksUrlFromSaleorApiUrl } from "./urls";

const debug = createDebug("verify-signature");

/**
 * @deprecated
 * use verifySignatureFromApiUrl
 */
export const verifySignature = async (domain: string, signature: string, rawBody: string) => {
  const [header, , jwsSignature] = signature.split(".");
  const jws: jose.FlattenedJWSInput = {
    protected: header,
    payload: rawBody,
    signature: jwsSignature,
  };

  const remoteJwks = jose.createRemoteJWKSet(
    new URL(getJwksUrl(domain))
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
 * Verify payload signature with public key of given `domain`
 * https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks#payload-signature
 */
export const verifySignatureFromApiUrl = async (
  apiUrl: string,
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
    new URL(getJwksUrlFromSaleorApiUrl(apiUrl))
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
