import { describe, expect, it, vi } from "vitest";

import { SALEOR_SCHEMA_VERSION } from "@/const";

import { createManifestHandler, CreateManifestHandlerOptions } from "./create-manifest-handler";
import { createLambdaEvent, mockLambdaContext } from "./test-utils";

describe("AWS Lambda createManifestHandler", () => {
  it("Creates a handler that responds with manifest, includes a request and baseUrl in factory method", async () => {
    // Note: AWS lambda uses stages which are passed in lambda request context
    // Contexts are appended to the lambda base URL, like so: <baseUrl>/<stage>
    // In this case we're simulating test stage, which results in <baseUrl>/test
    // More details: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    const baseUrl = "https://some-app-host.cloud/test";
    const event = createLambdaEvent({
      method: "GET",
      path: "/manifest",
      headers: {
        "content-type": "application/json",
        host: "some-app-host.cloud",
        "x-forwarded-proto": "https",
        [SALEOR_SCHEMA_VERSION]: "3.20",
      },
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

    const response = await handler(event, mockLambdaContext);

    expect(mockManifestFactory).toHaveBeenCalledWith(
      expect.objectContaining({
        appBaseUrl: baseUrl,
        request: event,
        schemaVersion: 3.2,
      })
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toStrictEqual({
      appUrl: baseUrl,
      id: "app-id",
      name: "Test app",
      permissions: [],
      tokenTargetUrl: `${baseUrl}/api/register`,
      version: "1",
    });
  });
});
