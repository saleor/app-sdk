import { createMocks } from "node-mocks-http";
import { describe, expect, it } from "vitest";

import { SALEOR_SCHEMA_VERSION } from "@/const";
import { AppManifest } from "@/types";

import { createManifestHandler } from "./create-manifest-handler";

describe("createManifestHandler", () => {
  it("Creates a handler that responds with Manifest. Includes request in context", async () => {
    expect.assertions(4);

    const { res, req } = createMocks({
      headers: {
        host: "some-saleor-host.cloud",
        "x-forwarded-proto": "https",
        [SALEOR_SCHEMA_VERSION]: "3.20",
      },
      method: "GET",
    });

    const handler = createManifestHandler({
      manifestFactory({ appBaseUrl, request }): AppManifest {
        expect(request).toBeDefined();
        expect(request.headers.host).toBe("some-saleor-host.cloud");

        return {
          name: "Mock name",
          tokenTargetUrl: `${appBaseUrl}/api/register`,
          appUrl: appBaseUrl,
          permissions: [],
          id: "app-id",
          version: "1",
        };
      },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);

    expect(res._getJSONData()).toEqual({
      appUrl: "https://some-saleor-host.cloud",
      id: "app-id",
      name: "Mock name",
      permissions: [],
      tokenTargetUrl: "https://some-saleor-host.cloud/api/register",
      version: "1",
    });
  });
});
