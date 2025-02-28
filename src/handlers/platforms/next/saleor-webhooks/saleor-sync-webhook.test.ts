import { createMocks } from "node-mocks-http";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildSyncWebhookResponsePayload, WebhookError } from "@/handlers/shared";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { MockAPL } from "@/test-utils/mock-apl";

import { SaleorSyncWebhook } from "./saleor-sync-webhook";
import { NextJsWebhookHandler } from "./saleor-webhook";

describe("Next.js SaleorSyncWebhook", () => {
  const mockAPL = new MockAPL();
  const baseUrl = "http://saleor-app.com";
  const validSyncWebhookConfiguration = {
    apl: mockAPL,
    webhookPath: "api/webhooks/checkout-calculate-taxes",
    event: "CHECKOUT_CALCULATE_TAXES",
    query: "subscription { event { ... on CheckoutCalculateTaxes { payload } } }",
    name: "Webhook test name",
    isActive: true,
  } as const;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getWebhookManifest", () => {
    it("should return full path to the webhook route based on given baseUrl", () => {
      const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);
      const manifest = saleorSyncWebhook.getWebhookManifest(baseUrl);
      expect(manifest).toEqual(
        expect.objectContaining({
          targetUrl: `${baseUrl}/${validSyncWebhookConfiguration.webhookPath}`,
        }),
      );
    });

    it("should return a valid manifest", () => {
      const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);
      expect(saleorSyncWebhook.getWebhookManifest(baseUrl)).toStrictEqual({
        syncEvents: ["CHECKOUT_CALCULATE_TAXES"],
        isActive: validSyncWebhookConfiguration.isActive,
        name: validSyncWebhookConfiguration.name,
        targetUrl: `${baseUrl}/${validSyncWebhookConfiguration.webhookPath}`,
        query: validSyncWebhookConfiguration.query,
      });
    });
  });

  describe("createHandler", () => {
    it("validates request before passing it to provided handler function with context including buildResponse", async () => {
      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "ok",
        context: {
          baseUrl: "example.com",
          event: "checkout_calculate_taxes",
          payload: { data: "test_payload" },
          schemaVersion: [3, 19],
          authData: {
            token: validSyncWebhookConfiguration.apl.mockToken,
            jwks: validSyncWebhookConfiguration.apl.mockJwks,
            saleorApiUrl: validSyncWebhookConfiguration.apl.workingSaleorApiUrl,
            appId: validSyncWebhookConfiguration.apl.mockAppId,
          },
        },
      });

      const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);
      const testHandler: NextJsWebhookHandler = vi.fn().mockImplementation((_req, res) => {
        const responsePayload = buildSyncWebhookResponsePayload({
          lines: [{ tax_rate: 8, total_net_amount: 10, total_gross_amount: 1.08 }],
          shipping_price_gross_amount: 2,
          shipping_tax_rate: 8,
          shipping_price_net_amount: 1,
        });
        res.status(200).send(responsePayload);
      });

      const { req, res } = createMocks({ method: "POST" });
      const wrappedHandler = saleorSyncWebhook.createHandler(testHandler);
      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(testHandler).toBeCalledTimes(1);
      expect(res._getData()).toEqual(
        expect.objectContaining({
          lines: [{ tax_rate: 8, total_net_amount: 10, total_gross_amount: 1.08 }],
          shipping_price_gross_amount: 2,
          shipping_tax_rate: 8,
          shipping_price_net_amount: 1,
        }),
      );
    });

    it("prevents handler execution when validation fails", async () => {
      const handler = vi.fn();
      const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);

      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "failure",
        error: new Error("Test error"),
      });

      const { req, res } = createMocks({ method: "POST" });
      await saleorSyncWebhook.createHandler(handler)(req, res);

      expect(handler).not.toHaveBeenCalled();
    });

    describe("when validation throws WebhookError", () => {
      it("calls onError and uses formatErrorResponse when provided", async () => {
        const webhookError = new WebhookError("Test error", "OTHER");
        const formatErrorResponse = vi.fn().mockResolvedValue({
          code: 418,
          body: "Custom response",
        });

        const saleorSyncWebhook = new SaleorSyncWebhook({
          ...validSyncWebhookConfiguration,
          onError: vi.fn(),
          formatErrorResponse,
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: webhookError,
        });

        const { req, res } = createMocks({ method: "POST" });
        await saleorSyncWebhook.createHandler(() => {})(req, res);

        expect(saleorSyncWebhook.onError).toHaveBeenCalledWith(webhookError, req);
        expect(formatErrorResponse).toHaveBeenCalledWith(webhookError, req);
        expect(res.statusCode).toBe(418);
        expect(res._getData()).toBe("Custom response");
      });

      it("calls onError and uses default JSON response when formatErrorResponse is not provided", async () => {
        const webhookError = new WebhookError("Test error", "OTHER");
        const saleorSyncWebhook = new SaleorSyncWebhook({
          ...validSyncWebhookConfiguration,
          onError: vi.fn(),
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: webhookError,
        });

        const { req, res } = createMocks({ method: "POST" });
        await saleorSyncWebhook.createHandler(() => {})(req, res);

        expect(saleorSyncWebhook.onError).toHaveBeenCalledWith(webhookError, req);
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({
          error: { type: "OTHER", message: "Test error" },
        });
      });

      describe("WebhookError code mapping", () => {
        it("should map OTHER error to 500 status code", async () => {
          const webhookError = new WebhookError("Internal server error", "OTHER");
          const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);

          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks({ method: "POST" });
          await saleorSyncWebhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(500);
          expect(res._getJSONData()).toEqual({
            error: { type: "OTHER", message: "Internal server error" },
          });
        });

        it("should map MISSING_HOST_HEADER error to 400 status code", async () => {
          const webhookError = new WebhookError("Missing host header", "MISSING_HOST_HEADER");
          const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);

          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks({ method: "POST" });
          await saleorSyncWebhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(400);
          expect(res._getJSONData()).toEqual({
            error: { type: "MISSING_HOST_HEADER", message: "Missing host header" },
          });
        });

        it("should map NOT_REGISTERED error to 401 status code", async () => {
          const webhookError = new WebhookError("Not registered", "NOT_REGISTERED");
          const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);

          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks({ method: "POST" });
          await saleorSyncWebhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(401);
          expect(res._getJSONData()).toEqual({
            error: { type: "NOT_REGISTERED", message: "Not registered" },
          });
        });

        it("should map WRONG_METHOD error to 405 status code", async () => {
          const webhookError = new WebhookError("Wrong HTTP method", "WRONG_METHOD");
          const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);

          vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
            result: "failure",
            error: webhookError,
          });

          const { req, res } = createMocks({ method: "POST" });
          await saleorSyncWebhook.createHandler(() => {})(req, res);

          expect(res.statusCode).toBe(405);
          expect(res._getJSONData()).toEqual({
            error: { type: "WRONG_METHOD", message: "Wrong HTTP method" },
          });
        });
      });
    });

    describe("when validation throws a generic Error", () => {
      const genericError = new Error("Unexpected error");

      it("calls onError and uses formatErrorResponse when provided", async () => {
        const formatErrorResponse = vi.fn().mockResolvedValue({
          code: 500,
          body: "Server error",
        });

        const saleorSyncWebhook = new SaleorSyncWebhook({
          ...validSyncWebhookConfiguration,
          onError: vi.fn(),
          formatErrorResponse,
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: genericError,
        });

        const { req, res } = createMocks({ method: "POST" });
        await saleorSyncWebhook.createHandler(() => {})(req, res);

        expect(saleorSyncWebhook.onError).toHaveBeenCalledWith(genericError, req);
        expect(formatErrorResponse).toHaveBeenCalledWith(genericError, req);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toBe("Server error");
      });

      it("calls onError and uses default text response when formatErrorResponse is not provided", async () => {
        const saleorSyncWebhook = new SaleorSyncWebhook({
          ...validSyncWebhookConfiguration,
          onError: vi.fn(),
        });

        vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
          result: "failure",
          error: genericError,
        });

        const { req, res } = createMocks({ method: "POST" });
        await saleorSyncWebhook.createHandler(() => {})(req, res);

        expect(saleorSyncWebhook.onError).toHaveBeenCalledWith(genericError, req);
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toBe("Unexpected error while handling request");
      });
    });
  });
});
