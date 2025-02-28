import { createMocks } from "node-mocks-http";
import { describe, expect, it, vi } from "vitest";

import { SALEOR_SCHEMA_VERSION } from "@/const";

import { createManifestHandler, CreateManifestHandlerOptions } from "./create-manifest-handler";

describe("Next.js createManifestHandler", () => {
  it("Creates a handler that responds with Manifest. Includes request in context", async () => {
    const baseUrl = "https://some-app-host.cloud";

    const { res, req } = createMocks({
      headers: {
        host: "some-app-host.cloud",
        "x-forwarded-proto": "https",
        [SALEOR_SCHEMA_VERSION]: "3.20",
      },
      method: "GET",
    });

    const mockManifestFactory = vi
      .fn<CreateManifestHandlerOptions["manifestFactory"]>()
      .mockImplementation(({ appBaseUrl }) => ({
        name: "Test app",
        tokenTargetUrl: `${appBaseUrl}/api/register`,
        appUrl: appBaseUrl,
        permissions: [],
        id: "app-id",
        version: "1",
      }));

    const handler = createManifestHandler({
      manifestFactory: mockManifestFactory,
    });

    await handler(req, res);

    expect(mockManifestFactory).toHaveBeenCalledWith({
      appBaseUrl: baseUrl,
      request: req,
      schemaVersion: [3, 20],
    });

    expect(res.statusCode).toBe(200);

    expect(res._getJSONData()).toEqual({
      appUrl: "https://some-app-host.cloud",
      id: "app-id",
      name: "Test app",
      permissions: [],
      tokenTargetUrl: "https://some-app-host.cloud/api/register",
      version: "1",
    });
  });
});
