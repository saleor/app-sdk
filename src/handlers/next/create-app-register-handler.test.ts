import { createMocks } from "node-mocks-http";
import { describe, expect,it, vi } from "vitest";

import { APL } from "../../APL";
import { createAppRegisterHandler } from "./create-app-register-handler";

describe("create-app-register-handler", () => {
  it("Sets auth data for correct request", async () => {
    const mockApl: APL = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
    };

    const { res, req } = createMocks({
      params: {
        // this doesnt work -> maybe replace mocks package
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

    expect(mockApl.set).toHaveBeenCalledWith({});
  });
});
