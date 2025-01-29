import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockAdapter } from "@/test-utils/mock-adapter";
import { MockAPL } from "@/test-utils/mock-apl";
import * as verifySignatureModule from "@/verify-signature";

import { PlatformAdapterMiddleware } from "./adapter-middleware";
import { SaleorWebhookValidator } from "./saleor-webhook-validator";

vi.spyOn(verifySignatureModule, "verifySignatureFromApiUrl").mockImplementation(
  async (domain, signature) => {
    if (signature !== "mocked_signature") {
      throw new Error("Wrong signature");
    }
  }
);
vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockImplementation(
  async (domain, signature) => {
    if (signature !== "mocked_signature") {
      throw new Error("Wrong signature");
    }
  }
);

describe("SaleorWebhookValidator", () => {
  const mockAPL = new MockAPL();
  const validator = new SaleorWebhookValidator();
  let adapter: MockAdapter;
  let middleware: PlatformAdapterMiddleware<unknown>;

  const validHeaders = {
    saleorApiUrl: mockAPL.workingSaleorApiUrl,
    event: "product_updated",
    schemaVersion: 3.2,
    signature: "mocked_signature",
    authorizationBearer: "mocked_bearer",
    domain: "example.com",
  };

  beforeEach(() => {
    adapter = new MockAdapter();
    middleware = new PlatformAdapterMiddleware(adapter);
    vi.spyOn(adapter, "getBaseUrl").mockReturnValue("https://example-app.com/api");
  });

  it("Processes valid request", async () => {
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "ok",
      context: expect.objectContaining({
        baseUrl: "https://example-app.com/api",
        event: "product_updated",
        payload: {},
        schemaVersion: null,
      }),
    });
  });

  it("Throws error on non-POST request method", async () => {
    vi.spyOn(adapter, "method", "get").mockReturnValue("GET");

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: "Wrong request method, only POST allowed",
      }),
    });
  });

  it("Throws error on missing api url header", async () => {
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      // @ts-expect-error testing missing saleorApiUrl
      saleorApiUrl: null,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: "Missing saleor-api-url header",
      }),
    });
  });

  it("Throws error on missing event header", async () => {
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue({
      // @ts-expect-error testing missing event
      event: null,
      signature: "mocked_signature",
      saleorApiUrl: mockAPL.workingSaleorApiUrl,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: "Missing saleor-event header",
      }),
    });
  });

  it("Throws error on mismatched event header", async () => {
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      event: "different_event",
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: "Wrong incoming request event: different_event. Expected: product_updated",
      }),
    });
  });

  it("Throws error on missing signature header", async () => {
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      // @ts-expect-error testing missing signature
      signature: null,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: "Missing saleor-signature header",
      }),
    });
  });

  it("Throws error on missing request body", async () => {
    vi.spyOn(adapter, "getRawBody").mockResolvedValue("");
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: "Missing request body",
      }),
    });
  });

  it("Throws error on unregistered app", async () => {
    const unregisteredApiUrl = "https://not-registered.example.com/graphql/";

    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      saleorApiUrl: unregisteredApiUrl,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: expect.objectContaining({
        message: `Can't find auth data for ${unregisteredApiUrl}. Please register the application`,
      }),
    });
  });

  it("Fallbacks to null if version is missing in payload", async () => {
    vi.spyOn(adapter, "getRawBody").mockResolvedValue(JSON.stringify({}));
    vi.spyOn(middleware, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      adapterMiddleware: middleware,
    });

    expect(result).toMatchObject({
      result: "ok",
      context: expect.objectContaining({
        schemaVersion: null,
      }),
    });
  });
});
