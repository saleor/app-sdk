import { beforeEach, describe, expect, it, vi } from "vitest";

import * as verifyJWTModule from "@/auth/browser/verify-jwt";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@/headers";
import { MockAdapter } from "@/test-utils/mock-adapter";
import { MockAPL } from "@/test-utils/mock-apl";
import * as extractUserModule from "@/util/extract-user-from-jwt";

import { ProtectedActionValidator } from "./protected-action-validator";

describe("ProtectedActionValidator", () => {
  let mockAPL: MockAPL;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAPL = new MockAPL();
    mockAdapter = new MockAdapter({
      baseUrl: "https://example.com",
      mockHeaders: {
        [SALEOR_API_URL_HEADER]: mockAPL.workingSaleorApiUrl,
        [SALEOR_AUTHORIZATION_BEARER_HEADER]: mockAPL.mockToken,
      },
    });

    vi.spyOn(verifyJWTModule, "verifyJWT").mockResolvedValue(undefined);
    vi.spyOn(extractUserModule, "extractUserFromJwt").mockReturnValue({
      email: "user@domain.com",
      userPermissions: [],
    });
  });

  describe("validateRequest", () => {
    it("should validate request successfully when all parameters are valid", async () => {
      const validator = new ProtectedActionValidator(mockAdapter);

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result.result).toBe("ok");
      expect(result.value).toEqual({
        baseUrl: "https://example.com",
        authData: {
          token: mockAPL.mockToken,
          saleorApiUrl: mockAPL.workingSaleorApiUrl,
          appId: mockAPL.mockAppId,
          jwks: mockAPL.mockJwks,
        },
        user: { email: "user@domain.com", userPermissions: [] },
      });
    });

    it("should fail validation when baseUrl is missing", async () => {
      mockAdapter.config.baseUrl = "";
      const validator = new ProtectedActionValidator(mockAdapter);

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result).toEqual({
        result: "failure",
        value: {
          bodyType: "string",
          status: 400,
          body: "Validation error: Missing host header",
        },
      });
    });

    it("should fail validation when saleor-api-url header is missing", async () => {
      const adapter = new MockAdapter({
        baseUrl: "https://example.com",
        mockHeaders: {
          // SALEOR_API_URL_HEADER is missing
          [SALEOR_AUTHORIZATION_BEARER_HEADER]: mockAPL.mockToken,
        },
      });
      const validator = new ProtectedActionValidator(adapter);

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result).toEqual({
        result: "failure",
        value: {
          bodyType: "string",
          status: 400,
          body: "Validation error: Missing saleor-api-url header",
        },
      });
    });

    it("should fail validation when authorization-bearer header is missing", async () => {
      const adapter = new MockAdapter({
        baseUrl: "https://example.com",
        mockHeaders: {
          [SALEOR_API_URL_HEADER]: mockAPL.workingSaleorApiUrl,
          // SALEOR_AUTHORIZATION_BEARER_HEADER is missing
        },
      });
      const validator = new ProtectedActionValidator(adapter);

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result).toEqual({
        result: "failure",
        value: {
          bodyType: "string",
          status: 400,
          body: "Validation error: Missing authorization-bearer header",
        },
      });
    });

    it("should fail validation when APL has no auth data for the API URL", async () => {
      mockAPL.workingSaleorApiUrl = "";
      const validator = new ProtectedActionValidator(mockAdapter);

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result).toEqual({
        result: "failure",
        value: {
          bodyType: "string",
          status: 401,
          body: "Validation error: Can't find auth data for saleorApiUrl https://example.com/graphql/. Please register the application",
        },
      });
    });

    it("should fail validation when JWT verification fails", async () => {
      const validator = new ProtectedActionValidator(mockAdapter);

      vi.spyOn(verifyJWTModule, "verifyJWT").mockRejectedValue(
        new Error("JWT verification failed"),
      );

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result).toEqual({
        result: "failure",
        value: {
          bodyType: "string",
          status: 401,
          body: "Validation error: JWT verification failed",
        },
      });
    });

    it("should fail validation when user extraction from JWT fails", async () => {
      const validator = new ProtectedActionValidator(mockAdapter);

      vi.spyOn(extractUserModule, "extractUserFromJwt").mockImplementation(() => {
        throw new Error("Failed to extract user");
      });

      const result = await validator.validateRequest({
        apl: mockAPL,
        requiredPermissions: ["MANAGE_APPS"],
      });

      expect(result).toEqual({
        result: "failure",
        value: {
          bodyType: "string",
          status: 500,
          body: "Unexpected error: parsing user from JWT",
        },
      });
    });
  });
});
