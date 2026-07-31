import * as jose from "jose";
import { describe, expect, it } from "vitest";

import { getJoseErrorReason } from "./get-jose-error-reason";

describe("getJoseErrorReason", () => {
  it("Surfaces the jose error code for a generic JOSE error", () => {
    const error = new jose.errors.JWSSignatureVerificationFailed();

    const reason = getJoseErrorReason(error);

    expect(reason).toContain("ERR_JWS_SIGNATURE_VERIFICATION_FAILED");
  });

  it("Surfaces the jose error code for a missing matching key", () => {
    const error = new jose.errors.JWKSNoMatchingKey();

    expect(getJoseErrorReason(error)).toContain("ERR_JWKS_NO_MATCHING_KEY");
  });

  it("Surfaces the failing claim and reason for a claim validation failure", () => {
    const error = new jose.errors.JWTExpired(
      "exp claim timestamp check failed",
      {},
      "exp",
      "check_failed",
    );

    const reason = getJoseErrorReason(error);

    expect(reason).toContain("ERR_JWT_EXPIRED");
    expect(reason).toContain("claim=");
    expect(reason).toContain("exp");
    expect(reason).toContain("reason=");
    expect(reason).toContain("check_failed");
  });

  it("Falls back to the message for a plain Error", () => {
    expect(getJoseErrorReason(new Error("boom"))).toBe("boom");
  });

  it("Stringifies non-error values", () => {
    expect(getJoseErrorReason("just a string")).toBe("just a string");
  });
});
