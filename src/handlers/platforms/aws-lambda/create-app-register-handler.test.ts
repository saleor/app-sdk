import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "@/APL";
import { SALEOR_API_URL_HEADER } from "@/const";
import * as fetchRemoteJwksModule from "@/fetch-remote-jwks";
import * as getAppIdModule from "@/get-app-id";
import { MockAPL } from "@/test-utils/mock-apl";

import {
  createAppRegisterHandler,
  CreateAppRegisterHandlerOptions,
} from "./create-app-register-handler";
import { createLambdaEvent, mockLambdaContext } from "./test-utils";

describe("AWS Lambda createAppRegisterHandler", () => {
  const mockJwksValue = "{}";
  const mockAppId = "42";
  const saleorApiUrl = "https://mock-saleor-domain.saleor.cloud/graphql/";
  const authToken = "mock-auth-token";

  vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue(mockJwksValue);
  vi.spyOn(getAppIdModule, "getAppId").mockResolvedValue(mockAppId);

  let mockApl: MockAPL;
  let event: APIGatewayProxyEventV2;
  beforeEach(() => {
    mockApl = new MockAPL();
    event = createLambdaEvent({
      body: JSON.stringify({ auth_token: authToken }),
      headers: {
        "content-type": "application/json",
        host: "mock-slaeor-domain.saleor.cloud",
        "x-forwarded-proto": "https",
        [SALEOR_API_URL_HEADER]: saleorApiUrl,
      },
    });
  });

  it("Sets auth data for correct Lambda event", async () => {
    const handler = createAppRegisterHandler({ apl: mockApl });
    const response = await handler(event, mockLambdaContext);

    expect(response.statusCode).toBe(200);
    expect(mockApl.set).toHaveBeenCalledWith({
      saleorApiUrl,
      token: authToken,
      appId: mockAppId,
      jwks: mockJwksValue,
    });
  });

  it("Returns 403 for prohibited Saleor URLs in Lambda event", async () => {
    event.headers[SALEOR_API_URL_HEADER] = "https://wrong-domain.saleor.cloud/graphql/";

    const handler = createAppRegisterHandler({
      apl: mockApl,
      allowedSaleorUrls: [(url) => url === "https://correct-domain.saleor.cloud"],
    });

    const response = await handler(event, mockLambdaContext);
    const body = JSON.parse(response.body!);

    expect(response.statusCode).toBe(403);
    expect(body.success).toBe(false);
  });

  it("Handles invalid JSON bodies in Lambda event", async () => {
    event.body = "{ ";
    const handler = createAppRegisterHandler({ apl: mockApl });
    const response = await handler(event, mockLambdaContext);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("Invalid request json.");
  });

  describe("Lambda callback hooks", () => {
    const expectedAuthData: AuthData = {
      token: authToken,
      saleorApiUrl,
      jwks: mockJwksValue,
      appId: mockAppId,
    };

    it("Triggers success callbacks with Lambda event context", async () => {
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

      await handler(event, mockLambdaContext);

      expect(mockOnRequestStart).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          authToken,
          saleorApiUrl,
        })
      );
      expect(mockOnRequestVerified).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          authData: expectedAuthData,
        })
      );
      expect(mockOnAuthAplSaved).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          authData: expectedAuthData,
        })
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

      await handler(event, mockLambdaContext);

      expect(mockOnAuthAplFailed).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          error: expect.any(Error),
          authData: expectedAuthData,
        })
      );
    });

    it("Allows custom error responses via hooks", async () => {
      const mockOnRequestStart = vi
        .fn<NonNullable<CreateAppRegisterHandlerOptions["onRequestStart"]>>()
        .mockImplementation((_req, context) =>
          context.respondWithError({
            status: 401,
            message: "test message",
          })
        );
      const handler = createAppRegisterHandler({
        apl: mockApl,
        onRequestStart: mockOnRequestStart,
      });

      const response = await handler(event, mockLambdaContext);

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.body!)).toStrictEqual({
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
