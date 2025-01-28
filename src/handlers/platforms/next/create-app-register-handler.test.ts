import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { APL, AuthData } from "@/APL";
import * as fetchRemoteJwksModule from "@/fetch-remote-jwks";
import * as getAppIdModule from "@/get-app-id";
import { MockAPL } from "@/test-utils/mock-apl";

import { createAppRegisterHandler } from "./create-app-register-handler";

const mockJwksValue = "{}";
const mockAppId = "42";

// Cannot use vi.mock on module, due to issues with alias resolution
// in vitest vs TypeScript: https://github.com/vitest-dev/vitest/issues/3105
vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue("{}");
vi.spyOn(getAppIdModule, "getAppId").mockResolvedValue("42");

describe("create-app-register-handler", () => {
  let mockApl: APL;

  beforeEach(() => {
    mockApl = new MockAPL();
  });

  it("Sets auth data for correct request", async () => {
    const { res, req } = createMocks({
      /**
       * Use body, instead of params, otherwise - for some reason - param is not accessible in mock request
       * Maybe this is a bug https://github.com/howardabrams/node-mocks-http/blob/master/lib/mockRequest.js
       */
      body: {
        auth_token: "mock-auth-token",
      },
      headers: {
        host: "some-saleor-host.cloud",
        "x-forwarded-proto": "https",
        "saleor-api-url": "https://mock-saleor-domain.saleor.cloud/graphql/",
      },
      method: "POST",
    });

    const handler = createAppRegisterHandler({
      apl: mockApl,
    });

    await handler(req, res);

    /**
     * It fails -> params.auth_token isn't present
     */
    expect(mockApl.set).toHaveBeenCalledWith({
      saleorApiUrl: "https://mock-saleor-domain.saleor.cloud/graphql/",
      token: "mock-auth-token",
      appId: "42",
      jwks: "{}",
    });
  });

  it("Returns 403 if configured to work only for specific saleor URL and try to install on prohibited one", async () => {
    const { res, req } = createMocks({
      /**
       * Use body, instead of params, otherwise - for some reason - param is not accessible in mock request
       * Maybe this is a bug https://github.com/howardabrams/node-mocks-http/blob/master/lib/mockRequest.js
       */
      body: {
        auth_token: "mock-auth-token",
      },
      headers: {
        host: "some-saleor-host.cloud",
        "x-forwarded-proto": "https",
        "saleor-api-url": "https://wrong-saleor-domain.saleor.cloud/graphql/",
      },
      method: "POST",
    });

    const handler = createAppRegisterHandler({
      apl: mockApl,
      allowedSaleorUrls: [(url: string) => url === "https://mock-saleor-domain.saleor.cloud"],
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData().success).toBe(false);
  });

  describe("Callback hooks", () => {
    it("Runs callback hooks - successful saving to APL scenario", async () => {
      const mockOnRequestStart = vi.fn();
      const mockOnRequestVerified = vi.fn();
      const mockOnAuthAplFailed = vi.fn();
      const mockOnAuthAplSaved = vi.fn();

      const { res, req } = createMocks({
        /**
         * Use body, instead of params, otherwise - for some reason - param is not accessible in mock request
         * Maybe this is a bug https://github.com/howardabrams/node-mocks-http/blob/master/lib/mockRequest.js
         */
        body: {
          auth_token: "mock-auth-token",
        },
        headers: {
          host: "some-saleor-host.cloud",
          "x-forwarded-proto": "https",
          "saleor-api-url": "https://mock-saleor-domain.saleor.cloud/graphql/",
        },
        method: "POST",
      });

      const handler = createAppRegisterHandler({
        apl: mockApl,
        onRequestStart: mockOnRequestStart,
        onRequestVerified: mockOnRequestVerified,
        onAplSetFailed: mockOnAuthAplFailed,
        onAuthAplSaved: mockOnAuthAplSaved,
      });

      const expectedAuthData: AuthData = {
        token: "mock-auth-token",
        saleorApiUrl: "https://mock-saleor-domain.saleor.cloud/graphql/",
        jwks: mockJwksValue,
        appId: mockAppId,
      };

      await handler(req, res);

      expect(mockOnRequestStart).toHaveBeenCalledWith(
        expect.anything(/* Assume original request */),
        expect.objectContaining({
          authToken: "mock-auth-token",
          saleorApiUrl: "https://mock-saleor-domain.saleor.cloud/graphql/",
        })
      );
      expect(mockOnRequestVerified).toHaveBeenCalledWith(
        expect.anything(/* Assume original request */),
        expect.objectContaining({
          authData: expectedAuthData,
        })
      );
      expect(mockOnAuthAplSaved).toHaveBeenCalledWith(
        expect.anything(/* Assume original request */),
        expect.objectContaining({
          authData: expectedAuthData,
        })
      );
      expect(mockOnAuthAplFailed).not.toHaveBeenCalled();
    });

    it("Runs callback hooks - failed saving to APL scenario", async () => {
      const mockOnAuthAplFailed = vi.fn();
      const mockOnAuthAplSaved = vi.fn();

      (mockApl.set as Mock).mockImplementationOnce(() => {
        throw new Error("test error");
      });

      const { res, req } = createMocks({
        /**
         * Use body, instead of params, otherwise - for some reason - param is not accessible in mock request
         * Maybe this is a bug https://github.com/howardabrams/node-mocks-http/blob/master/lib/mockRequest.js
         */
        body: {
          auth_token: "mock-auth-token",
        },
        headers: {
          host: "some-saleor-host.cloud",
          "x-forwarded-proto": "https",
          "saleor-api-url": "https://mock-saleor-domain.saleor.cloud/graphql/",
        },
        method: "POST",
      });

      const handler = createAppRegisterHandler({
        apl: mockApl,
        onAplSetFailed: mockOnAuthAplFailed,
        onAuthAplSaved: mockOnAuthAplSaved,
      });

      const expectedAuthData: AuthData = {
        token: "mock-auth-token",
        saleorApiUrl: "https://mock-saleor-domain.saleor.cloud/graphql/",
        jwks: mockJwksValue,
        appId: mockAppId,
      };

      await handler(req, res);

      expect(mockOnAuthAplSaved).not.toHaveBeenCalled();
      expect(mockOnAuthAplFailed).toHaveBeenCalledWith(
        expect.anything(/* Assume original request */),
        expect.objectContaining({
          authData: expectedAuthData,
          error: expect.objectContaining({
            message: "test error",
          }),
        })
      );
    });

    it("Allows to send custom error response via callback hook", async () => {
      const mockOnRequestStart = vi.fn().mockImplementation(
        (
          req,
          context: {
            respondWithError(params: { status: number; body: string; message: string }): Error;
          }
        ) =>
          context.respondWithError({
            status: 401,
            body: "test",
            message: "test message",
          })
      );

      const { res, req } = createMocks({
        /**
         * Use body, instead of params, otherwise - for some reason - param is not accessible in mock request
         * Maybe this is a bug https://github.com/howardabrams/node-mocks-http/blob/master/lib/mockRequest.js
         */
        body: {
          auth_token: "mock-auth-token",
        },
        headers: {
          host: "some-saleor-host.cloud",
          "x-forwarded-proto": "https",
          "saleor-api-url": "https://mock-saleor-domain.saleor.cloud/graphql/",
        },
        method: "POST",
      });

      const handler = createAppRegisterHandler({
        apl: mockApl,
        onRequestStart: mockOnRequestStart,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: {
          code: "REGISTER_HANDLER_HOOK_ERROR",
          message: "test message",
        },
      });
    });
  });
});
