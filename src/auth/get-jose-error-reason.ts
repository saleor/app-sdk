import * as jose from "jose";

/**
 * Extracts a specific, human-readable reason from an error thrown while verifying
 * a JWT / JWKS signature.
 *
 * jose throws typed errors that carry a machine-readable `code`
 * (e.g. `ERR_JWKS_NO_MATCHING_KEY`, `ERR_JWS_SIGNATURE_VERIFICATION_FAILED`,
 * `ERR_JWT_EXPIRED`) and, for claim validation failures, the offending `claim`
 * and `reason`. We surface all of this so that otherwise opaque
 * "verification failed" errors can actually be debugged from logs / responses.
 */
export const getJoseErrorReason = (error: unknown): string => {
  if (
    error instanceof jose.errors.JWTClaimValidationFailed ||
    error instanceof jose.errors.JWTExpired
  ) {
    const parts = [`${error.code}: ${error.message}`];

    if (error.claim) {
      parts.push(`claim="${error.claim}"`);
    }

    if (error.reason) {
      parts.push(`reason="${error.reason}"`);
    }

    return parts.join(", ");
  }

  if (error instanceof jose.errors.JOSEError) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};
