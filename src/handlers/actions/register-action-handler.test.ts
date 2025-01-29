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

  vi.spyOn(getAppIdModule, "getAppId").mockResolvedValue(mockAuthData.appId);
  vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue(mockAuthData.jwks);

  beforeEach(() => {
    vi.clearAllMocks();
    mockApl = new MockAPL();
    adapter = new MockAdapter({
      mockHeaders: {
        [SALEOR_API_URL_HEADER]: mockAuthData.saleorApiUrl,
      },
      baseUrl: "http://example.com",
    });
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
      vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });
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

    it("should successfully register app", async () => {
      vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });


      const handler = new RegisterActionHandler(adapter);
      const result = await handler.handleAction({ apl: mockApl });

      expect(result.status).toBe(200);
      expect(mockApl.set).toHaveBeenCalledWith(mockAuthData);
      const body = result.body as RegisterHandlerResponseBody;
      expect(body.success).toBe(true);
    });

    it("should handle APL save failure", async () => {
      vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });
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
        vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });

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

      it("should map error correctly when onRequestStart throws RegisterCallbackError", async () => {
        const errorMessage = "Custom validation error";
        const onRequestStart = vi.fn().mockImplementation((_req, { respondWithError }) => {
          respondWithError({
            message: errorMessage,
            status: 422
          });
        });

        vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });

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

        vi.spyOn(adapter, "getBody").mockResolvedValue({ auth_token: mockAuthData.token });

        const handler = new RegisterActionHandler(adapter);
        const result = await handler.handleAction({ apl: mockApl, onRequestStart });

        expect(onRequestStart).toHaveBeenCalled();
        expect(result.status).toBe(500);
        expect(result.body).toBe("Error during app installation");
      });
    });
  });
});

