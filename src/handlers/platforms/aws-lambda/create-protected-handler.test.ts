import { describe, expect, it, vi } from "vitest";

import {
  ProtectedActionValidator,
  ProtectedHandlerContext,
} from "@/handlers/shared/protected-action-validator";
import { MockAPL } from "@/test-utils/mock-apl";
import { Permission } from "@/types";

import { AwsLambdaProtectedHandler, createProtectedHandler } from "./create-protected-handler";
import { createLambdaEvent, mockLambdaContext } from "./test-utils";

describe("AWS Lambda createProtectedHandler", () => {
  const mockAPL = new MockAPL();
  const mockHandlerFn = vi.fn<AwsLambdaProtectedHandler>(() => ({
    statusCode: 200,
    body: "success",
  }));

  const mockHandlerContext: ProtectedHandlerContext = {
    baseUrl: "https://example.com",
    authData: {
      token: mockAPL.mockToken,
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      appId: mockAPL.mockAppId,
      jwks: mockAPL.mockJwks,
    },
    user: {
      email: "test@example.com",
      userPermissions: [],
    },
  };

  const event = createLambdaEvent({
    headers: {
      host: "some-saleor-host.cloud",
      "x-forwarded-proto": "https",
    },
    method: "GET",
  });

  describe("validation", () => {
    it("sends error when request validation fails", async () => {
      vi.spyOn(ProtectedActionValidator.prototype, "validateRequest").mockResolvedValueOnce({
        result: "failure",
        value: {
          status: 401,
          body: "Unauthorized",
          bodyType: "string",
        },
      });

      const handler = createProtectedHandler(mockHandlerFn, mockAPL);
      const response = await handler(event, mockLambdaContext);

      expect(mockHandlerFn).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(401);
    });

    it("calls handler function when validation succeeds", async () => {
      vi.spyOn(ProtectedActionValidator.prototype, "validateRequest").mockResolvedValueOnce({
        result: "ok",
        value: mockHandlerContext,
      });

      const handler = createProtectedHandler(mockHandlerFn, mockAPL);
      await handler(event, mockLambdaContext);

      expect(mockHandlerFn).toHaveBeenCalledWith(event, mockLambdaContext, mockHandlerContext);
    });
  });

  describe("permissions handling", () => {
    it("checks if required permissions are satisfies using validator", async () => {
      const validateRequestSpy = vi.spyOn(ProtectedActionValidator.prototype, "validateRequest");
      const requiredPermissions: Permission[] = ["MANAGE_APPS"];

      const handler = createProtectedHandler(mockHandlerFn, mockAPL, requiredPermissions);
      await handler(event, mockLambdaContext);

      expect(validateRequestSpy).toHaveBeenCalledWith({
        apl: mockAPL,
        requiredPermissions,
      });
    });
  });

  describe("error handling", () => {
    it("returns 500 status when user handler function throws error", async () => {
      vi.spyOn(ProtectedActionValidator.prototype, "validateRequest").mockResolvedValueOnce({
        result: "ok",
        value: mockHandlerContext,
      });

      mockHandlerFn.mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      const handler = createProtectedHandler(mockHandlerFn, mockAPL);
      const response = await handler(event, mockLambdaContext);

      expect(response.statusCode).toBe(500);
    });
  });
});
