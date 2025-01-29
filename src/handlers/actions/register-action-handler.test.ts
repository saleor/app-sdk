import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "@/APL";
import { SALEOR_API_URL_HEADER } from "@/const";
import * as fetchRemoteJwksModule from "@/fetch-remote-jwks";
import * as getAppIdModule from "@/get-app-id";
import { MockAdapter } from "@/test-utils/mock-adapter";
import { MockAPL } from "@/test-utils/mock-apl";

import { RegisterActionHandler, RegisterHandlerResponseBody } from "./register-action-handler";

describe("RegisterActionHandler", () => {
  let adapter: MockAdapter;
  let mockApl: MockAPL;

  const mockAuthData = {
    token: "mock-auth-token",
    saleorApiUrl: "https://mock-saleor-domain.saleor.cloud/graphql",
    jwks: "mock-jwks",
    appId: "mock-app-id"
  } as const satisfies AuthData;


  beforeEach(() => {
    vi.clearAllMocks();
    mockApl = new MockAPL();
    adapter = new MockAdapter({
      mockHeaders: {
        [SALEOR_API_URL_HEADER]: mockAuthData.saleorApiUrl,
      },
      baseUrl: "http://example.com",
    });

    vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });
    vi.spyOn(getAppIdModule, "getAppId").mockResolvedValue(mockAuthData.appId);
    vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue(mockAuthData.jwks);
  });

  describe("handleAction", () => {
    it("should validate request method", async () => {
      adapter.method = "GET";

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(405);
    });

    it("should validate Saleor API URL presence", async () => {
      // Set missing headers in request
      adapter = new MockAdapter({ mockHeaders: {}, baseUrl: "http://example.com" });

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(400);
    });

    it("should validate auth token presence", async () => {
      vi.spyOn(adapter, "getBody").mockResolvedValue({});

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(400);
      expect(result.body).toBe("Missing auth token.");
    });

    it("should validate allowed Saleor URLs", async () => {
      vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({
        apl: mockApl,
        allowedSaleorUrls: ["different-domain.saleor.cloud"]
      });

      expect(result.status).toBe(403);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body.error?.code).toBe("SALEOR_URL_PROHIBITED");
    });

    it("should return error when APL is not configured", async () => {
      mockApl.isConfigured.mockResolvedValue({ configured: false });

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(503);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body.success).toBe(false);
      expect(body.error).toEqual({
        code: "APL_NOT_CONFIGURED",
        message: "APL_NOT_CONFIGURED. App is configured properly. Check APL docs for help."
      });
    });

    it("should return error when app ID cannot be fetched", async () => {
      vi.spyOn(getAppIdModule, "getAppId").mockResolvedValue(undefined);

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(401);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body).toEqual({
        success: false,
        error: {
          code: "UNKNOWN_APP_ID",
          message: `The auth data given during registration request could not be used to fetch app ID. 
          This usually means that App could not connect to Saleor during installation. Saleor URL that App tried to connect: ${mockAuthData.saleorApiUrl}`
        }
      });
    });

    it("should return error when JWKS cannot be fetched", async () => {
      vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockRejectedValue(
        new Error("Network error")
      );

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(401);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body).toEqual({
        success: false,
        error: {
          code: "JWKS_NOT_AVAILABLE",
          message: "Can't fetch the remote JWKS."
        }
      });
    });

    it("should return error when JWKS is empty", async () => {
      vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue("");

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(401);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body).toEqual({
        success: false,
        error: {
          code: "JWKS_NOT_AVAILABLE",
          message: "Can't fetch the remote JWKS."
        }
      });
    });

    it("should return response when app is successfully registered", async () => {
      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(200);
      expect(mockApl.set).toHaveBeenCalledWith(mockAuthData);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body.success).toBe(true);
    });

    it("should handle APL save failure when no onAplSetFailed callback is provided", async () => {
      mockApl.set.mockRejectedValue(new Error("APL save failed"));

      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(500);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body.success).toBe(false);
    });

    it("should execute lifecycle hooks in correct order", async () => {
      const hookOrder: string[] = [];
      const config = {
        apl: mockApl,
        onRequestStart: vi.fn().mockImplementation(() => {
          hookOrder.push("onRequestStart");
        }),
        onRequestVerified: vi.fn().mockImplementation(() => {
          hookOrder.push("onRequestVerified");
        }),
        onAuthAplSaved: vi.fn().mockImplementation(() => {
          hookOrder.push("onAuthAplSaved");
        })
      };

      vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });

      const handler = new RegisterActionHandler(adapter);
      await handler.handleAction(config);

      expect(hookOrder).toEqual([
        "onRequestStart",
        "onRequestVerified",
        "onAuthAplSaved"
      ]);
      expect(mockApl.set).toHaveBeenCalledWith(mockAuthData);
    });

    describe("onRequestStart callback", () => {
      it("should proceed with execution and call onRequestStart when provided", async () => {
        const onRequestStart = vi.fn();

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({ apl: mockApl, onRequestStart });

        // Verify onRequestStart was called with correct parameters
        expect(onRequestStart).toHaveBeenCalledWith(
          adapter.request,
          expect.objectContaining({
            authToken: mockAuthData.token,
            saleorApiUrl: mockAuthData.saleorApiUrl,
            respondWithError: expect.any(Function)
          })
        );

        // Verify the registration flow completed successfully
        expect(result.status).toBe(200);
        const body = result.body as RegisterHandlerResponseBody;
        expect(body.success).toBe(true);
        expect(mockApl.set).toHaveBeenCalledWith(mockAuthData);
      });

      it("should map error correctly when onRequestStart calls respondWithError", async () => {
        const errorMessage = "Custom validation error";
        const onRequestStart = vi.fn().mockImplementation((_req, { respondWithError }) => {
          respondWithError({
            message: errorMessage,
            status: 422
          });
        });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({ apl: mockApl, onRequestStart });

        expect(onRequestStart).toHaveBeenCalled();
        expect(result.status).toBe(422);
        const body = result.body as RegisterHandlerResponseBody;
        expect(body).toEqual({
          success: false,
          error: {
            code: "REGISTER_HANDLER_HOOK_ERROR",
            message: errorMessage
          }
        });
      });


      it("should handle generic errors from onRequestStart", async () => {
        const onRequestStart = vi.fn().mockImplementation(() => {
          throw new Error("Unexpected error");
        });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({ apl: mockApl, onRequestStart });

        expect(onRequestStart).toHaveBeenCalled();
        expect(result.status).toBe(500);
        expect(result.body).toBe("Error during app installation");
      });
    });

    describe("onRequestVerified callback", () => {
      it("should proceed with execution and call onRequestVerified if provided", async () => {
        const onRequestVerified = vi.fn();

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onRequestVerified
        });

        expect(result.status).toBe(200);
        expect(onRequestVerified).toHaveBeenCalledWith(
          adapter.request,
          expect.objectContaining({
            authData: mockAuthData,
            respondWithError: expect.any(Function)
          })
        );
        expect(mockApl.set).toHaveBeenCalledWith(mockAuthData);
      });

      it("should map and return error when onRequestVerified calls respondWithError", async () => {
        const errorMessage = "Verification failed";
        const onRequestVerified = vi.fn().mockImplementation((_req, { respondWithError }) => {
          respondWithError({
            message: errorMessage,
            status: 422
          });
        });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onRequestVerified
        });

        expect(result.status).toBe(422);
        const body = result.body as RegisterHandlerResponseBody;
        expect(body).toEqual({
          success: false,
          error: {
            code: "REGISTER_HANDLER_HOOK_ERROR",
            message: errorMessage
          }
        });
        expect(mockApl.set).not.toHaveBeenCalled();
      });

      it("should handle generic errors thrown from onRequestVerified callback", async () => {
        const onRequestVerified = vi.fn().mockImplementation(() => {
          throw new Error("Unexpected error");
        });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onRequestVerified
        });

        expect(result.status).toBe(500);
        expect(result.body).toBe("Error during app installation");
        expect(mockApl.set).not.toHaveBeenCalled();
      });
    });

    describe("onAuthAplSaved callback", () => {
      it("should proceed with execution and call if onAuthAplSaved is provided", async () => {
        const onAuthAplSaved = vi.fn();

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onAuthAplSaved
        });

        expect(result.status).toBe(200);
        expect(onAuthAplSaved).toHaveBeenCalledWith(
          adapter.request,
          expect.objectContaining({
            authData: mockAuthData,
            respondWithError: expect.any(Function)
          })
        );
      });

      it("should map and return error when onAuthAplSaved calls respondWithError", async () => {
        const errorMessage = "Post-save validation failed";
        const onAuthAplSaved = vi.fn().mockImplementation((_req, { respondWithError }) => {
          respondWithError({
            message: errorMessage,
            status: 422
          });
        });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onAuthAplSaved
        });

        expect(result.status).toBe(422);
        const body = result.body as RegisterHandlerResponseBody;
        expect(body).toEqual({
          success: false,
          error: {
            code: "REGISTER_HANDLER_HOOK_ERROR",
            message: errorMessage
          }
        });
      });

      it("should map thrown error from onAuthAplSaved callback", async () => {
        const onAuthAplSaved = vi.fn().mockImplementation(() => {
          throw new Error("Unexpected error");
        });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onAuthAplSaved
        });

        expect(result.status).toBe(500);
        expect(result.body).toBe("Error during app installation");
      });
    });

    describe("onAplSetFailed callback", () => {
      it("should call onAplSetFailed is provided and when APL save fails", async () => {
        const onAplSetFailed = vi.fn();
        const aplError = new Error("APL save error");
        mockApl.set.mockRejectedValue(aplError);

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onAplSetFailed
        });

        expect(result.status).toBe(500);
        expect(onAplSetFailed).toHaveBeenCalledWith(
          adapter.request,
          expect.objectContaining({
            authData: mockAuthData,
            error: aplError,
            respondWithError: expect.any(Function)
          })
        );
        const body = result.body as RegisterHandlerResponseBody;
        expect(body.success).toBe(false);
      });

      it("should map and return error when onAplSetFailed calls respondWithError", async () => {
        const errorMessage = "Custom error handling";
        const onAplSetFailed = vi.fn().mockImplementation((_req, { respondWithError }) => {
          respondWithError({
            message: errorMessage,
            status: 503
          });
        });
        mockApl.set.mockRejectedValue(new Error("APL save error"));

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onAplSetFailed
        });

        expect(result.status).toBe(503);
        const body = result.body as RegisterHandlerResponseBody;
        expect(body).toEqual({
          success: false,
          error: {
            code: "REGISTER_HANDLER_HOOK_ERROR",
            message: errorMessage
          }
        });
      });

      it("should map thrown error from onAplSetFailed callback", async () => {
        const onAplSetFailed = vi.fn().mockImplementation(() => {
          throw new Error("Unexpected error");
        });
        mockApl.set.mockRejectedValue(new Error("APL save error"));

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({
          apl: mockApl,
          onAplSetFailed
        });

        expect(result.status).toBe(500);
        expect(result.body).toBe("Error during app installation");
      });
    });
  });
});

