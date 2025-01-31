import { beforeEach, describe, expect, it, vi } from "vitest";

import { SALEOR_SCHEMA_VERSION } from "@/const";
import { MockAdapter } from "@/test-utils/mock-adapter";
import { AppManifest } from "@/types";

import { ManifestActionHandler } from "./manifest-action-handler";

describe("ManifestActionHandler", () => {
  const mockManifest: AppManifest = {
    id: "test-app",
    name: "Test Application",
    version: "1.0.0",
    appUrl: "http://example.com",
    permissions: [],
    tokenTargetUrl: "http://example.com/token",
  };

  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter({
      mockHeaders: {
        [SALEOR_SCHEMA_VERSION]: "3.20",
      },
      baseUrl: "http://example.com",
    });
    adapter.method = "GET";
  });

  it("should call manifest factory and return 200 status when it resolves", async () => {
    const handler = new ManifestActionHandler(adapter);
    const manifestFactory = vi.fn().mockResolvedValue(mockManifest);

    const result = await handler.handleAction({ manifestFactory });

    expect(result.status).toBe(200);
    expect(result.body).toEqual(mockManifest);
    expect(manifestFactory).toHaveBeenCalledWith({
      appBaseUrl: "http://example.com",
      request: {},
      schemaVersion: 3.20,
    });
  });

  it("should call manifest factory and return 500 when it throws an error", async () => {
    const handler = new ManifestActionHandler(adapter);
    const manifestFactory = vi.fn().mockRejectedValue(new Error("Test error"));

    const result = await handler.handleAction({ manifestFactory });

    expect(result.status).toBe(500);
    expect(result.body).toBe("Error resolving manifest file.");
  });

  it("should return 405 when not called using HTTP GET method", async () => {
    adapter.method = "POST";
    const handler = new ManifestActionHandler(adapter);

    const manifestFactory = vi.fn().mockResolvedValue(mockManifest);

    const result = await handler.handleAction({ manifestFactory });

    expect(result.status).toBe(405);
    expect(result.body).toBe("Method not allowed");
    expect(manifestFactory).not.toHaveBeenCalled();
  })

  it("should return 400 when receives null schema version header from unsupported legacy Saleor version", async () => {
    adapter.getHeader = vi.fn().mockReturnValue(null);
    const handler = new ManifestActionHandler(adapter);

    const manifestFactory = vi.fn().mockResolvedValue(mockManifest);

    const result = await handler.handleAction({ manifestFactory });

    expect(result.status).toBe(400);
    expect(result.body).toBe("Missing schema version header");
    expect(manifestFactory).not.toHaveBeenCalled();
  });
});
