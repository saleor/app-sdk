import { createMocks } from "node-mocks-http";
import { describe, expect, it, vi } from "vitest";

import { APL } from "../../APL";
import { createAppRegisterHandler } from "./create-app-register-handler";

describe("create-app-register-handler", () => {
  it("Sets auth data for correct request", async () => {
    vi.mock("../../get-app-id", () => ({
      getAppId: vi.fn().mockResolvedValue("42"),
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
        "saleor-domain": "https://mock-saleor-domain.saleor.cloud",
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
      domain: "https://mock-saleor-domain.saleor.cloud",
      token: "mock-auth-token",
    });
  });
});
