import { afterEach, describe, expect, it, vi } from "vitest";

import { FormatWebhookErrorResult } from "@/handlers/shared";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { MockAPL } from "@/test-utils/mock-apl";
import { AsyncWebhookEventType } from "@/types";

import { SaleorAsyncWebhook } from "./saleor-async-webhook";
import { WebApiWebhookHandler, WebhookConfig } from "./saleor-webhook";

const webhookPath = "api/webhooks/product-updated";
const baseUrl = "http://example.com";

describe("Web API SaleorAsyncWebhook", () => {
  const mockAPL = new MockAPL();

  const validConfig: WebhookConfig<AsyncWebhookEventType> = {
    apl: mockAPL,
    event: "PRODUCT_UPDATED",
    webhookPath,
    query: "subscription { event { ... on ProductUpdated { product { id }}}}",
  } as const;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createHandler", () => {
    it("validates request before passing it to provided handler function with context", async () => {
      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "ok",
        context: {
          baseUrl: "example.com",
          event: "product_updated",
          payload: { data: "test_payload" },
          schemaVersion: 3.2,
          authData: {
            saleorApiUrl: mockAPL.workingSaleorApiUrl,
            token: mockAPL.mockToken,
            jwks: mockAPL.mockJwks,
            appId: mockAPL.mockAppId,
          },
        },
      });

      const handler = vi
        .fn<WebApiWebhookHandler>()
        .mockImplementation(() => new Response("OK", { status: 200 }));

      const webhook = new SaleorAsyncWebhook(validConfig);
      const request = new Request(`${baseUrl}/webhook`);

      const wrappedHandler = webhook.createHandler(handler);
      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
      expect(handler).toBeCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          payload: { data: "test_payload" },
          authData: expect.objectContaining({
            saleorApiUrl: mockAPL.workingSaleorApiUrl,
          }),
        })
      );
    });

    it("prevents handler execution when validation fails and returns error", async () => {
      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "failure",
        error: new Error("Test error"),
      });

      const webhook = new SaleorAsyncWebhook(validConfig);
      const handler = vi.fn();
      const request = new Request(`${baseUrl}/webhook`);

      const wrappedHandler = webhook.createHandler(handler);
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
      await expect(response.text()).resolves.toBe("Unexpected error while handling request");
      expect(handler).not.toHaveBeenCalled();
    });

    it("should allow overriding error responses using formatErrorResponse", async () => {
      vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
        result: "failure",
        error: new Error("Test error"),
      });

      const mockFormatErrorResponse = vi.fn().mockResolvedValue({
        body: "Custom error",
        code: 418,
      } as FormatWebhookErrorResult);
      const webhook = new SaleorAsyncWebhook({
        ...validConfig,
        formatErrorResponse: mockFormatErrorResponse,
      });

      const request = new Request(`${baseUrl}/webhook`, {
        method: "POST",
        headers: { "saleor-event": "invalid_event" },
      });

      const handler = vi.fn();
      const wrappedHandler = webhook.createHandler(handler);
      const response = await wrappedHandler(request);

      expect(response.status).toBe(418);
      await expect(response.text()).resolves.toBe("Custom error");
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
