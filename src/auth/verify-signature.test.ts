import { describe, expect, it } from "vitest";

import { verifySignatureWithJwks } from "@/auth/verify-signature";

/**
 * Actual signature copied from testing webhook payload.
 */
const testSignature =
  "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il0sImlzcyI6Imh0dHBzOi8vaGFja2F0aG9uLXNoaXBwaW5nLmV1LnNhbGVvci5jbG91ZC9ncmFwaHFsLyIsImtpZCI6InlLdzlYeUVmOHgyYnd5SkdCWVlTckhzeXpHaHhKaktLdlpkb2tOZTlGSWMiLCJ0eXAiOiJKV1QifQ..ShPbfvYc_A5Aq3hiT6sisDclKikDkhxOvGXT2ZWgdsGRjZpg9ukiHRZym0kbfMfDqU5C3Pfo6n7am0ExwbnFWBfOil3pfe3uJOcOn_UGRj76Fy-59TB0JdS_WuTgNQcYM8Yjvlq2sNK4jdAfJVRTTx8FVgEpFrHBKmcMPfD7zuDozswIDMZOkklYqBcyQ76DJYIRVhl3QsktYPPrxDoqf-GJ--e9FuNqtqNDksP1weiDSraqXCF4-Ie7UWZsMIFxkPF8jdKjF_s1UmNS8Xel8soFQQ9L6Gps-NEv7xcHicGt5lgohH4mqhz1YIxCR7v_NTQgWImu_GQ6ELBiBSIZ2Q";

const rawContent = "{\"__typename\": \"OrderCreated\"}";

const jwks =
  "{\"keys\": [{\"kty\": \"RSA\", \"key_ops\": [\"verify\"], \"n\": \"uDhbbpspufsQiqHsmC4kvmFQ5l2mGZsGcWhKVSQKQubSdXMedPpLnPD3Z3DsY76DILTm6WfOtSp5rr4KzF5wjurlOEhuFsB1HUfK9ZZB2nEDCQbweoIv3SOdclaNB__pYvQ0nmQHwsAeqH1QUuFUIvOL3t31rhjvzX6wvS49fGNb7rDlqQjufCvaX_n-ADJTgEAg6y1Mzn5NhgoTV1KTBeviyZqCdwvD6bk1ghN2XXWpNcARTzu3WHrmzIzkTwQeIMG8efwIddjfCaMGiOzAfzdQlqHlHPL1Xb5kV9AVX3kiSy-9shaQY23HdWwwiodrb4k2w34Z9ZZN-MHp8i6JdQ\", \"e\": \"AQAB\", \"use\": \"sig\", \"kid\": \"yKw9XyEf8x2bwyJGBYYSrHsyzGhxJjKKvZdokNe9FIc\"}]}";

describe("verifySignatureWithJwks", () => {
  it("Returns empty promise if signature is valid", () =>
    expect(verifySignatureWithJwks(jwks, testSignature, rawContent)).resolves.not.toThrow());

  it("Throws if signature is invalid", () =>
    expect(
      verifySignatureWithJwks(jwks, testSignature, "{\"forged\": \"payload\"}"),
    ).rejects.toThrow());
});
