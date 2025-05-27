import { afterEach, describe, expect, it, vi } from "vitest";

import { buildSyncWebhookResponsePayload, FormatWebhookErrorResult } from "@/handlers/shared";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { SALEOR_API_URL_HEADER, SALEOR_EVENT_HEADER, SALEOR_SIGNATURE_HEADER } from "@/headers";
import { MockAPL } from "@/test-utils/mock-apl";

import { SaleorSyncWebhook, WebApiSyncWebhookHandler } from "./saleor-sync-webhook";

describe("Web API SaleorSyncWebhook", () => {
  const mockAPL = new MockAPL();
  const baseUrl = "http://saleor-app.com";
  const webhookConfiguration = {
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

  it("should validate request and return Response", async () => {
    type Payload = { data: "test_payload" };

    vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
      result: "ok",
      context: {
        baseUrl: "example.com",
        event: "checkout_calculate_taxes",
        payload: { data: "test_payload" },
        schemaVersion: [3, 19],
        authData: {
          token: webhookConfiguration.apl.mockToken,
          jwks: webhookConfiguration.apl.mockJwks,
          saleorApiUrl: webhookConfiguration.apl.workingSaleorApiUrl,
          appId: webhookConfiguration.apl.mockAppId,
        },
      },
    });

    const handler = vi.fn<WebApiSyncWebhookHandler<Payload>>().mockImplementation(() => {
      const responsePayload = buildSyncWebhookResponsePayload<"ORDER_CALCULATE_TAXES">({
        lines: [{ tax_rate: 8, total_net_amount: 10, total_gross_amount: 1.08 }],
        shipping_price_gross_amount: 2,
        shipping_tax_rate: 8,
        shipping_price_net_amount: 1,
      });
      return new Response(JSON.stringify(responsePayload), { status: 200 });
    });

    const saleorSyncWebhook = new SaleorSyncWebhook<Payload>(webhookConfiguration);

    // Note: Requests are not representative of a real one,
    // we mock resolved value from webhook validator, which parses request
    const request = new Request(`${baseUrl}/webhook`);

    const wrappedHandler = saleorSyncWebhook.createHandler(handler);
    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toBeCalledTimes(1);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        lines: [{ tax_rate: 8, total_net_amount: 10, total_gross_amount: 1.08 }],
        shipping_price_gross_amount: 2,
        shipping_tax_rate: 8,
        shipping_price_net_amount: 1,
      }),
    );
  });

  it("should return error when request is not valid", async () => {
    vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
      result: "failure",
      error: new Error("Test error"),
    });

    const saleorSyncWebhook = new SaleorSyncWebhook({
      ...webhookConfiguration,
    });

    const handler = vi.fn();
    const wrappedHandler = saleorSyncWebhook.createHandler(handler);

    // Note: Requests are not representative of a real one,
    // we mock resolved value from webhook validator, which parses request
    const request = new Request(`${baseUrl}/webhook`);
    const response = await wrappedHandler(request);

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Unexpected error while handling request");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should allow overriding error responses using formatErrorResponse", async () => {
    const error = new Error("Test error");
    vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
      result: "failure",
      error,
    });

    const mockFormatErrorResponse = vi.fn().mockResolvedValue({
      body: "Custom error",
      code: 418,
    } as FormatWebhookErrorResult);

    const saleorSyncWebhook = new SaleorSyncWebhook({
      ...webhookConfiguration,
      formatErrorResponse: mockFormatErrorResponse,
    });

    const handler = vi.fn();
    const wrappedHandler = saleorSyncWebhook.createHandler(handler);

    // Note: Requests are not representative of a real one,
    // we mock resolved value from webhook validator, which parses request
    const request = new Request(`${baseUrl}/webhook`);
    const response = await wrappedHandler(request);

    expect(mockFormatErrorResponse).toHaveBeenCalledWith(error, request);
    expect(response.status).toBe(418);
    await expect(response.text()).resolves.toBe("Custom error");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should call externally injected signature verification function", async () => {
    const mockVerifySignatureFn = vi.fn().mockImplementationOnce(async () => {});

    const saleorSyncWebhook = new SaleorSyncWebhook({
      ...webhookConfiguration,
      verifySignatureFn: mockVerifySignatureFn,
    });

    const handler = saleorSyncWebhook.createHandler(() => new Response("OK", { status: 200 }));

    const request = new Request(`${baseUrl}/webhook`, {
      method: "POST",
      headers: {
        [SALEOR_API_URL_HEADER]: "https://example.com/graphql/",
        [SALEOR_SIGNATURE_HEADER]: "random-signature-test",
        [SALEOR_EVENT_HEADER]: "checkout_calculate_taxes",
      },
      body: JSON.stringify({}),
    });
    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(mockVerifySignatureFn).toHaveBeenCalledOnce();
  });
});
