import { describe, expect, it, vi } from "vitest";

import { SALEOR_SCHEMA_VERSION } from "@/const";

import { createManifestHandler, CreateManifestHandlerOptions } from "./create-manifest-handler";

describe("Fetch API createManifestHandler", () => {
  it("Creates a handler that responds with manifest, includes a request and baseUrl in factory method", async () => {
    const baseUrl = "https://some-app-host.cloud";
    const request = new Request(baseUrl, {
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

    const response = await handler(request);

    expect(mockManifestFactory).toHaveBeenCalledWith({
      appBaseUrl: baseUrl,
      request,
      schemaVersion: "3.20",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      appUrl: "https://some-app-host.cloud",
      id: "app-id",
      name: "Test app",
      permissions: [],
      tokenTargetUrl: "https://some-app-host.cloud/api/register",
      version: "1",
    });
  });
});
