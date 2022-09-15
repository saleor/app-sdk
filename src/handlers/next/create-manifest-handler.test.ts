import { createMocks } from "node-mocks-http";
import { describe, expect, it } from "vitest";

import { AppManifest } from "../../types";
import { createManifestHandler } from "./create-manifest-handler";

describe("createManifestHandler", () => {
  // TODO Fix test, Response.OK returns undefined
  it.fails("Creates a handler without error", async () => {
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

    const response = await handler(req, res);

    /**
     * TODO Fixme - why handler returns undefined?
     */
    expect(response).toEqual({});
  });
});
