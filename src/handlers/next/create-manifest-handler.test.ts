import { createMocks } from "node-mocks-http";
import { describe, expect, it } from "vitest";

import { AppManifest } from "../../types";
import { createManifestHandler } from "./create-manifest-handler";

describe("createManifestHandler", () => {
  it("Creates a handler that responds with Manifest", async () => {
    const { res, req } = createMocks({
      headers: {
        host: "some-saleor-host.cloud",
        "x-forwarded-proto": "https",
      },
      method: "GET",
    });

    const handler = createManifestHandler({
      manifestFactory(context: { appBaseUrl: string }): AppManifest {
        return {
          name: "Mock name",
          tokenTargetUrl: `${context.appBaseUrl}/api/register`,
          appUrl: context.appBaseUrl,
          permissions: [],
          id: "app-id",
          version: "1",
        };
      },
    });

    await handler(req, res);

    expect(res._getData()).toEqual({
      appUrl: "https://some-saleor-host.cloud",
      id: "app-id",
      name: "Mock name",
      permissions: [],
      tokenTargetUrl: "https://some-saleor-host.cloud/api/register",
      version: "1",
    });
  });
});
