import { afterEach, describe, expect, it, vi } from "vitest";

import { FormatWebhookErrorResult } from "@/handlers/shared";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { MockAPL } from "@/test-utils/mock-apl";

import { createLambdaEvent, mockLambdaContext } from "../test-utils";
import { AwsLambdaSyncWebhookHandler, SaleorSyncWebhook } from "./saleor-sync-webhook";

describe("AWS Lambda SaleorSyncWebhook", () => {
  const mockAPL = new MockAPL();

  const validSyncWebhookConfiguration = {
    apl: mockAPL,
    webhookPath: "api/webhooks/checkout-calculate-taxes",
    event: "CHECKOUT_CALCULATE_TAXES" as const,
    query: "subscription { event { ... on CheckoutCalculateTaxes { payload } } }",
    name: "Lambda Webhook Test",
    isActive: true,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate request and return successful tax calculation", async () => {
    type Payload = { data: "test_payload" };

    vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
      result: "ok",
      context: {
        baseUrl: "example.com",
        event: "CHECKOUT_CALCULATE_TAXES",
        payload: { data: "test_payload" },
        schemaVersion: 3.19,
        authData: {
          token: validSyncWebhookConfiguration.apl.mockToken,
          jwks: validSyncWebhookConfiguration.apl.mockJwks,
          saleorApiUrl: validSyncWebhookConfiguration.apl.workingSaleorApiUrl,
          appId: validSyncWebhookConfiguration.apl.mockAppId,
        },
      },
    });

    const saleorSyncWebhook = new SaleorSyncWebhook<Payload>(validSyncWebhookConfiguration);

    const handler: AwsLambdaSyncWebhookHandler<Payload> = vi
      .fn()
      .mockImplementation(async (_event, _context, ctx) => ({
        statusCode: 200,
        body: JSON.stringify(
          ctx.buildResponse({
            lines: [{ tax_rate: 8, total_net_amount: 10, total_gross_amount: 10.8 }],
            shipping_price_gross_amount: 2.16,
            shipping_tax_rate: 8,
            shipping_price_net_amount: 2,
          })
        ),
      }));
    const wrappedHandler = saleorSyncWebhook.createHandler(handler);

    // Note: Events are not representative,
    // we mock resolved value from webhook validator
    const event = createLambdaEvent();

    const response = await wrappedHandler(event, mockLambdaContext);

    expect(response.statusCode).toBe(200);
    expect(handler).toBeCalledTimes(1);
    expect(JSON.parse(response.body!)).toEqual({
      lines: [{ tax_rate: 8, total_net_amount: 10, total_gross_amount: 10.8 }],
      shipping_price_gross_amount: 2.16,
      shipping_tax_rate: 8,
      shipping_price_net_amount: 2,
    });
  });

  it("should return 500 error when validation fails", async () => {
    vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
      result: "failure",
      error: new Error("Test error"),
    });

    const saleorSyncWebhook = new SaleorSyncWebhook(validSyncWebhookConfiguration);

    const handler = vi.fn();
    const wrappedHandler = saleorSyncWebhook.createHandler(handler);

    const event = createLambdaEvent();

    const response = await wrappedHandler(event, mockLambdaContext);

    expect(response.statusCode).toBe(500);
    expect(response.body).toContain("Unexpected error while handling request");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should use custom error format when provided", async () => {
    const mockFormatErrorResponse = vi.fn().mockResolvedValue({
      body: "Customized error message",
      code: 418,
    } as FormatWebhookErrorResult);

    const error = new Error("Test error");
    vi.spyOn(SaleorWebhookValidator.prototype, "validateRequest").mockResolvedValue({
      result: "failure",
      error,
    });

    const saleorSyncWebhook = new SaleorSyncWebhook({
      ...validSyncWebhookConfiguration,
      formatErrorResponse: mockFormatErrorResponse,
    });

    const handler = vi.fn();
    const wrappedHandler = saleorSyncWebhook.createHandler(handler);

    // Note: Events are not representative,
    // we mock resolved value from webhook validator
    const event = createLambdaEvent();
    const response = await wrappedHandler(event, mockLambdaContext);

    expect(mockFormatErrorResponse).toHaveBeenCalledWith(error, event);
    expect(response.statusCode).toBe(418);
    expect(response.body).toBe("Customized error message");
    expect(handler).not.toHaveBeenCalled();
  });
});
