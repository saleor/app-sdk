import { ASTNode } from "graphql";
import { createMocks } from "node-mocks-http";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MockAPL } from "../../../test-utils/mock-apl";
import { AsyncWebhookEventType } from "../../../types";
import { processSaleorWebhook } from "./process-saleor-webhook";
import { SaleorAsyncWebhook } from "./saleor-async-webhook";
import { NextWebhookApiHandler, WebhookConfig } from "./saleor-webhook";

const webhookPath = "api/webhooks/product-updated";
const baseUrl = "http://example.com";

describe("SaleorAsyncWebhook", () => {
  const mockAPL = new MockAPL();

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  const validAsyncWebhookConfiguration: WebhookConfig<AsyncWebhookEventType> = {
    apl: mockAPL,
    event: "PRODUCT_UPDATED",
    webhookPath,
    query: "subscription { event { ... on ProductUpdated { product { id }}}}",
  } as const;

  const saleorAsyncWebhook = new SaleorAsyncWebhook(validAsyncWebhookConfiguration);

  it("constructor passes if query is provided", async () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new SaleorAsyncWebhook({
        ...validAsyncWebhookConfiguration,
        query: "subscription { event { ... on ProductUpdated { product { id }}}}",
      });
    }).not.toThrowError();
  });

  it("targetUrl should return full path to the webhook route based on given baseUrl", async () => {
    expect(saleorAsyncWebhook.getWebhookManifest(baseUrl)).toEqual(
      expect.objectContaining({
        targetUrl: `${baseUrl}/${webhookPath}`,
      })
    );
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
    vi.mock("./process-saleor-webhook");

    vi.mocked(processSaleorWebhook).mockImplementationOnce(async () => ({
      baseUrl: "example.com",
      event: "product_updated",
      payload: { data: "test_payload" },
      schemaVersion: 3.19,
      authData: {
        domain: "example.com",
        token: "token",
        jwks: "",
        saleorApiUrl: "https://example.com/graphql/",
        appId: "12345",
      },
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

  it("Calls callbacks for error handling", async () => {
    const onErrorCallback = vi.fn();
    const formatErrorCallback = vi.fn().mockImplementation(async () => ({
      code: 401,
      body: "My Body",
    }));

    const webhook = new SaleorAsyncWebhook({
      ...validAsyncWebhookConfiguration,
      onError: onErrorCallback,
      formatErrorResponse: formatErrorCallback,
    });

    // prepare mocked context returned by mocked process function
    vi.mock("./process-saleor-webhook");

    vi.mocked(processSaleorWebhook).mockImplementationOnce(async () => {
      /**
       * This mock should throw WebhookError, but there was TypeError related to constructor of extended class.
       * Try "throw new WebhookError()" to check it.
       *
       * For test suite it doesn't matter, because errors thrown from source code are valid
       */
      throw new Error("Test error message");
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testHandler: NextWebhookApiHandler = vi.fn().mockImplementation((req, res, context) => {
      if (context.payload.data === "test_payload") {
        res.status(200).end();
        return;
      }
      throw new Error("Test payload has not been passed to handler function");
    });

    const { req, res } = createMocks();
    const wrappedHandler = webhook.createHandler(testHandler);

    await wrappedHandler(req, res);

    /**
     * Response should match formatErrorCallback
     */
    expect(res.statusCode).toBe(401);
    expect(res._getData()).toBe("My Body");
    expect(onErrorCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Test error message",
      }),
      req,
      res
    );

    /**
     * Handler should not be called, since it thrown before
     */
    expect(testHandler).not.toHaveBeenCalled();
  });

  /**
   * Pre 0.35.0 - then remove
   */
  it("Allows legacy asyncEvent and subscriptionQueryAst fields, but fails if none provided", () => {
    expect(
      () =>
        new SaleorAsyncWebhook({
          asyncEvent: "ADDRESS_CREATED",
          subscriptionQueryAst: {} as unknown as ASTNode,
          apl: mockAPL,
          webhookPath: "",
        })
    ).not.toThrowError();

    expect(
      () =>
        new SaleorAsyncWebhook({
          subscriptionQueryAst: {} as unknown as ASTNode,
          apl: mockAPL,
          webhookPath: "",
        })
    ).toThrowError();

    expect(
      () =>
        new SaleorAsyncWebhook({
          asyncEvent: "ADDRESS_CREATED",
          apl: mockAPL,
          webhookPath: "",
        })
    ).toThrowError();
  });
});
