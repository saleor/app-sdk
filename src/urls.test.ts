import { describe, expect, test } from "vitest";

import { getJwksUrlFromSaleorApiUrl } from "./urls";

describe("urls.ts", () => {
  describe("getJwksUrlFromSaleorApiUrl function", () => {
    test("Resolves valid url from saleor api url", () => {
      expect(getJwksUrlFromSaleorApiUrl("https://my-saleor.saleor.cloud")).toBe(
        "https://my-saleor.saleor.cloud/.well-known/jwks.json"
      );
    });
  });
});
