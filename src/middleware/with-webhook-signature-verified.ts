import crypto from "crypto";
import * as jose from "jose";
import { Middleware } from "retes";
import { Response } from "retes/response";

import { SALEOR_SIGNATURE_HEADER } from "../const";
import { getSaleorHeaders } from "../headers";
import { getJwksUrl } from "../urls";

export const withWebhookSignatureVerified =
  (secretKey: string | undefined = undefined): Middleware =>
  (handler) =>
  async (request) => {
    const ERROR_MESSAGE = "Webhook signature verification failed:";

    if (request.rawBody === undefined) {
      return Response.InternalServerError({
        success: false,
        message: `${ERROR_MESSAGE} Request payload already parsed.`,
      });
    }

    const { domain: saleorDomain, signature: payloadSignature } = getSaleorHeaders(request.headers);

    if (!payloadSignature) {
      return Response.BadRequest({
        success: false,
        message: `${ERROR_MESSAGE} Missing ${SALEOR_SIGNATURE_HEADER} header.`,
      });
    }

    if (secretKey !== undefined) {
      const calculatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(request.rawBody)
        .digest("hex");

      if (calculatedSignature !== payloadSignature) {
        return Response.BadRequest({
          success: false,
          message: `${ERROR_MESSAGE} Verification using secret key has failed.`,
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
        new URL(getJwksUrl(saleorDomain))
      ) as jose.FlattenedVerifyGetKey;

      try {
        await jose.flattenedVerify(jws, remoteJwks);
      } catch {
        return Response.BadRequest({
          success: false,
          message: `${ERROR_MESSAGE} Verification using public key has failed.`,
        });
      }
    }

    return handler(request);
  };
