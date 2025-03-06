import { beforeEach, describe, expect, it } from "vitest";

import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION_HEADER,
  SALEOR_SIGNATURE_HEADER,
} from "@/headers";
import { MockAdapter } from "@/test-utils/mock-adapter";

import { SaleorRequestProcessor } from "./saleor-request-processor";

describe("SaleorRequestProcessor", () => {
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAdapter = new MockAdapter({});
  });

  describe("withMethod", () => {
    it("returns null when method is allowed", () => {
      mockAdapter.method = "POST";
      const middleware = new SaleorRequestProcessor(mockAdapter);

      const result = middleware.withMethod(["POST", "GET"]);

      expect(result).toBeNull();
    });

    it("returns 405 error when method is not allowed", () => {
      mockAdapter.method = "POST";
      const middleware = new SaleorRequestProcessor(mockAdapter);

      const result = middleware.withMethod(["GET"]);

      expect(result).toEqual({
        body: "Method not allowed",
        bodyType: "string",
        status: 405,
      });
    });
  });

  describe("withSaleorApiUrlPresent", () => {
    it("returns null when saleor-api-url header is present", () => {
      const adapter = new MockAdapter({
        mockHeaders: {
          [SALEOR_API_URL_HEADER]: "https://api.saleor.io",
        },
      });
      const middleware = new SaleorRequestProcessor(adapter);

      const result = middleware.withSaleorApiUrlPresent();

      expect(result).toBeNull();
    });

    it("returns 400 error when saleor api url is missing", () => {
      const middleware = new SaleorRequestProcessor(mockAdapter);

      const result = middleware.withSaleorApiUrlPresent();

      expect(result).toEqual({
        body: "Missing saleor-api-url header",
        bodyType: "string",
        status: 400,
      });
    });
  });

  describe("getSaleorHeaders", () => {
    it("correctly transforms header values", () => {
      const adapter = new MockAdapter({
        mockHeaders: {
          [SALEOR_AUTHORIZATION_BEARER_HEADER]: "bearer-token",
          [SALEOR_SIGNATURE_HEADER]: "signature-value",
          [SALEOR_EVENT_HEADER]: "event-name",
          [SALEOR_API_URL_HEADER]: "https://api.saleor.io",
          [SALEOR_SCHEMA_VERSION_HEADER]: "3.20",
        },
      });
      const middleware = new SaleorRequestProcessor(adapter);

      const result = middleware.getSaleorHeaders();

      expect(result).toEqual({
        authorizationBearer: "bearer-token",
        signature: "signature-value",
        event: "event-name",
        saleorApiUrl: "https://api.saleor.io",
        schemaVersion: "3.20",
      });
    });

    it("handles missing values correctly - returns undefined", () => {
      const middleware = new SaleorRequestProcessor(mockAdapter);

      const result = middleware.getSaleorHeaders();

      expect(result).toEqual({
        authorizationBearer: undefined,
        signature: undefined,
        event: undefined,
        saleorApiUrl: undefined,
        schemaVersion: undefined,
      });
    });

    it("handlers partially missing headers", () => {
      const adapter = new MockAdapter({
        mockHeaders: {
          // SALEOR_AUTHORIZATION_BEARER_HEADER missing
          [SALEOR_SIGNATURE_HEADER]: "signature-value",
          [SALEOR_EVENT_HEADER]: "event-name",
          [SALEOR_API_URL_HEADER]: "https://api.saleor.io",
          // SALEOR_SCHEMA_VERSION missing
        },
      });
      const middleware = new SaleorRequestProcessor(adapter);

      const result = middleware.getSaleorHeaders();

      expect(result).toEqual({
        authorizationBearer: undefined,
        signature: "signature-value",
        event: "event-name",
        saleorApiUrl: "https://api.saleor.io",
        schemaVersion: undefined,
      });
    });
  });
});
