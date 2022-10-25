import * as jose from "jose";

import { createDebug } from "./debug";
import { getJwksUrl } from "./urls";

const debug = createDebug("verify-signature");

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

    // TODO: if we chose the way of making framework agnostic verify functions, we should unify
    // how we return the errors
    return "Verification using public key has failed.";
  }
  return null;
};
