import { createMocks } from "node-mocks-http";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WebhookError } from "@/handlers/shared";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { MockAPL } from "@/test-utils/mock-apl";
import { AsyncWebhookEventType } from "@/types";

import { SaleorAsyncWebhook } from "./saleor-async-webhook";
import { NextJsWebhookHandler, WebhookConfig } from "./saleor-webhook";

const webhookPath = "api/webhooks/product-updated";
const baseUrl = "http://example.com";

describe("Next.js SaleorAsyncWebhook", () => {
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

  describe("getWebhookManifest", () => {
    it("should return full path to the webhook route based on given baseUrl", async () => {
      expect(saleorAsyncWebhook.getWebhookManifest(baseUrl)).toEqual(
        expect.objectContaining({
          targetUrl: `${baseUrl}/${webhookPath}`,
        })
      );
    });

    it("should return a valid manifest", async () => {
      expect(saleorAsyncWebhook.getWebhookManifest(baseUrl)).toStrictEqual({
        asyncEvents: ["PRODUCT_UPDATED"],
        isActive: true,
        name: "PRODUCT_UPDATED webhook",
        targetUrl: "http://example.com/api/webhooks/product-updated",
        query: "subscription { event { ... on ProductUpdated { product { id }}}}",
      });
    });
  });

  describe("createHandler", () => {
    it("validates request before passing it to provided handler function with context", async () => {
      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "ok",
        context: {
          baseUrl: "example.com",
          event: "product_updated",
          payload: { data: "test_payload" },
          schemaVersion: 3.19,
          authData: {
            token: "token",
            jwks: "",
            saleorApiUrl: "https://example.com/graphql/",
            appId: "12345",
          },
        },
      });

      const testHandler: NextJsWebhookHandler = vi.fn().mockImplementation((_req, res, context) => {
        if (context.payload.data === "test_payload") {
          res.status(200).end();
          return;
        }
        throw new Error("Test payload has not been passed to handler function");
      });

      const { req, res } = createMocks();
      const wrappedHandler = saleorAsyncWebhook.createHandler(testHandler);
      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(testHandler).toBeCalledTimes(1);
    });

    it("prevents handler execution when validation fails", async () => {
      const handler = vi.fn();
      const webhook = new SaleorAsyncWebhook(validAsyncWebhookConfiguration);

      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "failure",
        error: new Error("Test error"),
      });

      const { req, res } = createMocks();
      await webhook.createHandler(handler)(req, res);

      expect(handler).not.toHaveBeenCalled();
    });

    describe("when validation throws WebhookError", () => {
      it("calls onError and uses formatErrorResponse when provided", async () => {
        const webhookError = new WebhookError("Test error", "OTHER");
        const formatErrorResponse = vi.fn().mockResolvedValue({
          code: 418,
          body: "Custom response",
        });

        const webhook = new SaleorAsyncWebhook({
          ...validAsyncWebhookConfiguration,
          onError: vi.fn(),
          formatErrorResponse,
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: webhookError,
        });

        const { req, res } = createMocks();
        await webhook.createHandler(() => {})(req, res);

        expect(webhook.onError).toHaveBeenCalledWith(webhookError, req);
        expect(formatErrorResponse).toHaveBeenCalledWith(webhookError, req);
        expect(res.statusCode).toBe(418);
        expect(res._getData()).toBe("Custom response");
      });

      it("calls onError and uses default JSON response when formatErrorResponse not provided", async () => {
        const webhookError = new WebhookError("Test error", "OTHER");
        const webhook = new SaleorAsyncWebhook({
          ...validAsyncWebhookConfiguration,
          onError: vi.fn(),
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: webhookError,
        });

        const { req, res } = createMocks();
        await webhook.createHandler(() => {})(req, res);

        expect(webhook.onError).toHaveBeenCalledWith(webhookError, req);
        expect(res.statusCode).toBe(500); // OTHER error is mapped to 500
        expect(res._getJSONData()).toEqual({
          error: { type: "OTHER", message: "Test error" },
        });
      });

      describe("WebhookError code mapping", () => {
        const webhook = new SaleorAsyncWebhook(validAsyncWebhookConfiguration);

        it("should map OTHER error to 500 status code", async () => {
          const webhookError = new WebhookError("Internal server error", "OTHER");
          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks();
          await webhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(500);
          expect(res._getJSONData()).toEqual({
            error: {
              type: "OTHER",
              message: "Internal server error",
            },
          });
        });

        it("should map MISSING_HOST_HEADER error to 400 status code", async () => {
          const webhookError = new WebhookError("Missing host header", "MISSING_HOST_HEADER");
          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks();
          await webhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(400);
          expect(res._getJSONData()).toEqual({
            error: {
              type: "MISSING_HOST_HEADER",
              message: "Missing host header",
            },
          });
        });

        it("should map NOT_REGISTERED error to 401 status code", async () => {
          const webhookError = new WebhookError("Not registered", "NOT_REGISTERED");
          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks();
          await webhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(401);
          expect(res._getJSONData()).toEqual({
            error: {
              type: "NOT_REGISTERED",
              message: "Not registered",
            },
          });
        });

        it("should map WRONG_METHOD error to 405 status code", async () => {
          const webhookError = new WebhookError("Wrong HTTP method", "WRONG_METHOD");
          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks();
          await webhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(405);
          expect(res._getJSONData()).toEqual({
            error: {
              type: "WRONG_METHOD",
              message: "Wrong HTTP method",
            },
          });
        });
      });
    });

    describe("when validation throws generic Error", () => {
      const genericError = new Error("Unexpected error");

      it("calls onError and uses formatErrorResponse when provided", async () => {
        const formatErrorResponse = vi.fn().mockResolvedValue({
          code: 500,
          body: "Server error",
        });

        const webhook = new SaleorAsyncWebhook({
          ...validAsyncWebhookConfiguration,
          onError: vi.fn(),
          formatErrorResponse,
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: genericError,
        });

        const { req, res } = createMocks();
        await webhook.createHandler(() => {})(req, res);

        expect(webhook.onError).toHaveBeenCalledWith(genericError, req);
        expect(formatErrorResponse).toHaveBeenCalledWith(genericError, req);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toBe("Server error");
      });

      it("calls onError and uses default text response when formatErrorResponse not provided", async () => {
        const webhook = new SaleorAsyncWebhook({
          ...validAsyncWebhookConfiguration,
          onError: vi.fn(),
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: genericError,
        });

        const { req, res } = createMocks();
        await webhook.createHandler(() => {})(req, res);

        expect(webhook.onError).toHaveBeenCalledWith(genericError, req);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toBe("Unexpected error while handling request");
      });
    });
  });
});
