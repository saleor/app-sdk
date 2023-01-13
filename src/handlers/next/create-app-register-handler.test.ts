import { createMocks } from "node-mocks-http";
import { describe, expect, it, vi } from "vitest";

import { APL } from "../../APL";
import { createAppRegisterHandler } from "./create-app-register-handler";

vi.mock("../../get-app-id", () => ({
  getAppId: vi.fn().mockResolvedValue("42"),
}));

vi.mock("../../fetch-remote-jwks", () => ({
  fetchRemoteJwks: vi.fn().mockResolvedValue("{}"),
}));

const mockApl: APL = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  isReady: vi.fn().mockImplementation(async () => ({
    ready: true,
  })),
  isConfigured: vi.fn().mockImplementation(async () => ({
    configured: true,
  })),
};

describe("create-app-register-handler", () => {
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
        "saleor-domain": "https://mock-saleor-domain.saleor.cloud/",
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
      domain: "https://mock-saleor-domain.saleor.cloud/",
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
        "saleor-domain": "https://wrong-saleor-domain.saleor.cloud/",
      },
      method: "POST",
    });

    const handler = createAppRegisterHandler({
      apl: mockApl,
      allowedSaleorUrls: [(url: string) => url === "https://mock-saleor-domain.saleor.cloud"],
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getData().success).toBe(false);
  });
});
