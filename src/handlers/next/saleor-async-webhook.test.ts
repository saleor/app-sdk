import { ASTNode } from "graphql";
import { createMocks } from "node-mocks-http";
import { afterEach, describe, expect, it, vi } from "vitest";

import { APL } from "../../APL";
import { processAsyncSaleorWebhook } from "./process-async-saleor-webhook";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "./saleor-async-webhook";

const webhookPath = "api/webhooks/product-updated";
const baseUrl = "http://example.com";

describe("SaleorAsyncWebhook", () => {
  const mockAPL: APL = {
    get: async (domain: string) =>
      domain === "example.com"
        ? {
            domain: "example.com",
            token: "mock-token",
          }
        : undefined,
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    isReady: vi.fn(),
    isConfigured: vi.fn(),
  };

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  const validAsyncWebhookConfiguration = {
    apl: mockAPL,
    asyncEvent: "PRODUCT_UPDATED",
    webhookPath,
    query: "subscription { event { ... on ProductUpdated { product { id }}}}",
  };

  const saleorAsyncWebhook = new SaleorAsyncWebhook(validAsyncWebhookConfiguration);

  it("throw CONFIGURATION_ERROR if query and subscriptionQueryAst are both absent", async () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new SaleorAsyncWebhook({
        ...validAsyncWebhookConfiguration,
        // @ts-ignore: We make type error for test purpose
        query: undefined,
        subscriptionQueryAst: undefined,
      });
    }).toThrowError();
  });

  it("constructor passes if subscriptionQueryAst is provided", async () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new SaleorAsyncWebhook({
        ...validAsyncWebhookConfiguration,
        query: undefined,
        subscriptionQueryAst: {} as ASTNode,
      });
    }).not.toThrowError();
  });

  it("targetUrl should return full path to the webhook route based on given baseUrl", async () => {
    expect(saleorAsyncWebhook.getTargetUrl(baseUrl)).toBe(`${baseUrl}/${webhookPath}`);
  });

  it("getWebhookManifest should return a valid manifest", async () => {
    expect(saleorAsyncWebhook.getWebhookManifest(baseUrl)).toStrictEqual({
      asyncEvents: ["PRODUCT_UPDATED"],
      isActive: true,
      name: "PRODUCT_UPDATED webhook",
      targetUrl: "http://example.com/api/webhooks/product-updated",
      query: "subscription { event { ... on ProductUpdated { product { id }}}}",
    });
  });

  it("Test createHandler which return success", async () => {
    // prepare mocked context returned by mocked process function
    vi.mock("./process-async-saleor-webhook");

    vi.mocked(processAsyncSaleorWebhook).mockImplementationOnce(async () => ({
      baseUrl: "example.com",
      event: "product_updated",
      payload: { data: "test_payload" },
      authData: { domain: "example.com", token: "token" },
    }));

    // Test handler - will throw error if mocked context is not passed to it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testHandler: NextWebhookApiHandler = vi.fn().mockImplementation((req, res, context) => {
      if (context.payload.data === "test_payload") {
        res.status(200).end();
        return;
      }
      throw new Error("Test payload has not been passed to handler function");
    });

    // We are mocking validation method, so empty mock requests will pass
    const { req, res } = createMocks();
    const wrappedHandler = saleorAsyncWebhook.createHandler(testHandler);
    await wrappedHandler(req, res);
    expect(res.statusCode).toBe(200);

    // Check if test handler was used by the wrapper
    expect(testHandler).toBeCalledTimes(1);
  });
});
