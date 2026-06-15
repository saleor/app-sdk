import { describe, expect, it } from "vitest";

import {
  getBaseUrl,
  getSaleorHeaders,
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION_HEADER,
  SALEOR_SIGNATURE_HEADER,
} from "./headers";

describe("getSaleorHeaders", () => {
  it("extracts all Saleor-specific headers from a plain header map", () => {
    const result = getSaleorHeaders({
      [SALEOR_AUTHORIZATION_BEARER_HEADER]: "token",
      [SALEOR_SIGNATURE_HEADER]: "signature",
      [SALEOR_EVENT_HEADER]: "product_updated",
      [SALEOR_API_URL_HEADER]: "https://demo.saleor.io/graphql/",
      [SALEOR_SCHEMA_VERSION_HEADER]: "3.20",
    });

    expect(result).toStrictEqual({
      authorizationBearer: "token",
      signature: "signature",
      event: "product_updated",
      saleorApiUrl: "https://demo.saleor.io/graphql/",
      schemaVersion: "3.20",
    });
  });

  it("returns undefined for missing headers and stringifies array values", () => {
    const result = getSaleorHeaders({
      [SALEOR_EVENT_HEADER]: ["product_updated", "product_created"],
    });

    expect(result.event).toBe("product_updated,product_created");
    expect(result.signature).toBeUndefined();
    expect(result.authorizationBearer).toBeUndefined();
    expect(result.saleorApiUrl).toBeUndefined();
    expect(result.schemaVersion).toBeUndefined();
  });
});

describe("getBaseUrl", () => {
  it("defaults to http when x-forwarded-proto is absent", () => {
    expect(getBaseUrl({ host: "example.com" })).toBe("http://example.com");
  });

  it("uses the provided x-forwarded-proto value", () => {
    expect(getBaseUrl({ host: "example.com", "x-forwarded-proto": "https" })).toBe(
      "https://example.com",
    );
  });

  it("prefers https when multiple comma-separated protocols are present", () => {
    expect(getBaseUrl({ host: "example.com", "x-forwarded-proto": "http,https" })).toBe(
      "https://example.com",
    );
  });

  it("falls back to the first protocol when https is not present", () => {
    expect(getBaseUrl({ host: "example.com", "x-forwarded-proto": "ws,http" })).toBe(
      "ws://example.com",
    );
  });

  it("joins x-forwarded-proto array values before resolving the protocol", () => {
    expect(getBaseUrl({ host: "example.com", "x-forwarded-proto": ["http", "https"] })).toBe(
      "https://example.com",
    );
  });
});
