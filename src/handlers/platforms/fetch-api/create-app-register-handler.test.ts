import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "@/APL";
import * as fetchRemoteJwksModule from "@/auth/fetch-remote-jwks";
import * as getAppIdModule from "@/get-app-id";
import { SALEOR_API_URL_HEADER } from "@/headers";
import { MockAPL } from "@/test-utils/mock-apl";

import {
  createAppRegisterHandler,
  CreateAppRegisterHandlerOptions,
} from "./create-app-register-handler";

describe("Fetch API createAppRegisterHandler", () => {
  const mockJwksValue = "{}";
  const mockAppId = "42";
  const saleorApiUrl = "https://mock-saleor-domain.saleor.cloud/graphql/";
  const authToken = "mock-auth-token";

  vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue(mockJwksValue);
  vi.spyOn(getAppIdModule, "getAppId").mockResolvedValue(mockAppId);
  let mockApl: MockAPL;
  let request: Request;

  beforeEach(() => {
    mockApl = new MockAPL();
    request = new Request("https://example.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "mock-slaeor-domain.saleor.cloud",
        "X-Forwarded-Proto": "https",
        [SALEOR_API_URL_HEADER]: saleorApiUrl,
      },
      body: JSON.stringify({ auth_token: authToken }),
    });
  });

  it("Sets auth data for correct request", async () => {
    const handler = createAppRegisterHandler({ apl: mockApl });
    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(mockApl.set).toHaveBeenCalledWith({
      saleorApiUrl,
      token: authToken,
      appId: mockAppId,
      jwks: mockJwksValue,
    });
  });

  it("Returns 403 for prohibited Saleor URLs", async () => {
    request.headers.set(SALEOR_API_URL_HEADER, "https://wrong-domain.saleor.cloud/graphql/");
    const handler = createAppRegisterHandler({
      apl: mockApl,
      allowedSaleorUrls: [saleorApiUrl],
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it("Handles invalid JSON bodies", async () => {
    const brokenRequest = new Request("https://example.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "mock-slaeor-domain.saleor.cloud",
        "X-Forwarded-Proto": "https",
        [SALEOR_API_URL_HEADER]: saleorApiUrl,
      },
      body: "{ ",
    });
    const handler = createAppRegisterHandler({
      apl: mockApl,
      allowedSaleorUrls: [saleorApiUrl],
    });

    const response = await handler(brokenRequest);

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("Invalid request json.");
  });

  describe("Callback hooks", () => {
    const expectedAuthData: AuthData = {
      token: authToken,
      saleorApiUrl,
      jwks: mockJwksValue,
      appId: mockAppId,
    };

    it("Triggers success callbacks when APL save succeeds", async () => {
      const mockOnRequestStart = vi.fn();
      const mockOnRequestVerified = vi.fn();
      const mockOnAuthAplFailed = vi.fn();
      const mockOnAuthAplSaved = vi.fn();

      const handler = createAppRegisterHandler({
        apl: mockApl,
        onRequestStart: mockOnRequestStart,
        onRequestVerified: mockOnRequestVerified,
        onAplSetFailed: mockOnAuthAplFailed,
        onAuthAplSaved: mockOnAuthAplSaved,
      });

      await handler(request);

      expect(mockOnRequestStart).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          authToken,
          saleorApiUrl,
        }),
      );
      expect(mockOnRequestVerified).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          authData: expectedAuthData,
        }),
      );
      expect(mockOnAuthAplSaved).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          authData: expectedAuthData,
        }),
      );
      expect(mockOnAuthAplFailed).not.toHaveBeenCalled();
    });

    it("Triggers failure callback when APL save fails", async () => {
      const mockOnAuthAplFailed = vi.fn();
      const mockOnAuthAplSaved = vi.fn();

      mockApl.set.mockRejectedValueOnce(new Error("Save failed"));

      const handler = createAppRegisterHandler({
        apl: mockApl,
        onAplSetFailed: mockOnAuthAplFailed,
        onAuthAplSaved: mockOnAuthAplSaved,
      });

      await handler(request);

      expect(mockOnAuthAplFailed).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          error: expect.any(Error),
          authData: expectedAuthData,
        }),
      );
    });

    it("Allows custom error responses via hooks", async () => {
      const mockOnRequestStart = vi
        .fn<NonNullable<CreateAppRegisterHandlerOptions["onRequestStart"]>>()
        .mockImplementation((_req, context) =>
          context.respondWithError({
            status: 401,
            message: "test message",
          }),
        );
      const handler = createAppRegisterHandler({
        apl: mockApl,
        onRequestStart: mockOnRequestStart,
      });

      const response = await handler(request);

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toStrictEqual({
        error: {
          code: "REGISTER_HANDLER_HOOK_ERROR",
          message: "test message",
        },
        success: false,
      });
      expect(mockOnRequestStart).toHaveBeenCalled();
    });
  });
});
