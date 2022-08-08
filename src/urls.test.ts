import { describe, expect, test } from "vitest";

import { getGraphQLUrl, getJwksUrl } from "./urls";

describe("urls.ts", () => {
  describe("jwksUrl function", () => {
    test.each([
      ["localhost:8000", "http://localhost:8000/.well-known/jwks.json"],
      [
        "https://my-saleor.saleor.cloud",
        "https://https://my-saleor.saleor.cloud/.well-known/jwks.json",
      ],
    ])("resolves %s to be %s", (input, expectedOutput) => {
      expect(getJwksUrl(input)).toBe(expectedOutput);
    });
  });

  describe("graphQLUrl function", () => {
    test.each([
      ["localhost:8000", "http://localhost:8000/graphql/"],
      ["https://my-saleor.saleor.cloud", "https://https://my-saleor.saleor.cloud/graphql/"],
    ])("resolves %s to be %s", (input, expectedOutput) => {
      expect(getGraphQLUrl(input)).toBe(expectedOutput);
    });
  });
});
