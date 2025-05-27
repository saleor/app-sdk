import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "@/APL";
import * as fetchRemoteJwksModule from "@/auth/fetch-remote-jwks";
import * as verifySignatureModule from "@/auth/verify-signature";
import { MockAdapter } from "@/test-utils/mock-adapter";
import { MockAPL } from "@/test-utils/mock-apl";

import { SaleorRequestProcessor } from "./saleor-request-processor";
import { SaleorWebhookValidator } from "./saleor-webhook-validator";

describe("SaleorWebhookValidator", () => {
  const mockAPL = new MockAPL();

  let adapter: MockAdapter;
  let requestProcessor: SaleorRequestProcessor<unknown>;

  const validHeaders = {
    saleorApiUrl: mockAPL.workingSaleorApiUrl,
    event: "product_updated",
    schemaVersion: "3.20",
    signature: "mocked_signature",
    authorizationBearer: "mocked_bearer",
    domain: "example.com",
  };

  beforeEach(() => {
    adapter = new MockAdapter({ baseUrl: "https://example-app.com/api" });
    requestProcessor = new SaleorRequestProcessor(adapter);
  });

  it("Throws error on non-POST request method", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(adapter, "method", "get").mockReturnValue("GET");

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Wrong request method, only POST allowed",
        errorType: "WRONG_METHOD",
      },
    });
  });

  it("Throws error on missing base URL", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(adapter, "getBaseUrl").mockReturnValue("");
    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Missing host header",
        errorType: "MISSING_HOST_HEADER",
      },
    });
  });

  it("Throws error on missing api url header", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      // @ts-expect-error testing missing saleorApiUrl
      saleorApiUrl: null,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Missing saleor-api-url header",
        errorType: "MISSING_API_URL_HEADER",
      },
    });
  });

  it("Throws error on missing event header", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue({
      // @ts-expect-error testing missing event
      event: null,
      signature: "mocked_signature",
      saleorApiUrl: mockAPL.workingSaleorApiUrl,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Missing saleor-event header",
        errorType: "MISSING_EVENT_HEADER",
      },
    });
  });

  it("Throws error on mismatched event header", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      event: "different_event",
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Wrong incoming request event: different_event. Expected: product_updated",
        errorType: "WRONG_EVENT",
      },
    });
  });

  it("Throws error on missing signature header", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      // @ts-expect-error testing missing signature
      signature: null,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Missing saleor-signature header",
        errorType: "MISSING_SIGNATURE_HEADER",
      },
    });
  });

  it("Throws error on missing request body", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(adapter, "getRawBody").mockResolvedValue("");
    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Missing request body",
        errorType: "MISSING_REQUEST_BODY",
      },
    });
  });

  it("Throws error on unparsable request body", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(adapter, "getRawBody").mockResolvedValue("{ "); // broken JSON
    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: "Request body can't be parsed",
        errorType: "CANT_BE_PARSED",
      },
    });
  });

  it("Throws error on unregistered app", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    const unregisteredApiUrl = "https://not-registered.example.com/graphql/";

    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue({
      ...validHeaders,
      saleorApiUrl: unregisteredApiUrl,
    });

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "failure",
      error: {
        message: `Can't find auth data for ${unregisteredApiUrl}. Please register the application`,
        errorType: "NOT_REGISTERED",
      },
    });
  });

  it("Fallbacks to null if version is missing in payload", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(adapter, "getRawBody").mockResolvedValue(JSON.stringify({}));
    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
    });

    expect(result).toMatchObject({
      result: "ok",
      context: expect.objectContaining({
        schemaVersion: null,
      }),
    });
  });

  it("Returns success on valid request with signature passing validation against jwks in auth data", async () => {
    vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);

    const validator = new SaleorWebhookValidator();

    vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue(validHeaders);

    const result = await validator.validateRequest({
      allowedEvent: "PRODUCT_UPDATED",
      apl: mockAPL,
      adapter,
      requestProcessor,
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

  describe("JWKS re-try validation", () => {
    const authDataNoJwks = {
      token: mockAPL.mockToken,
      saleorApiUrl: mockAPL.workingSaleorApiUrl,
      appId: mockAPL.mockAppId,
      jwks: null, // Simulate missing JWKS in initial auth data
    } as unknown as AuthData; // We're testing missing jwks, so this is fine

    beforeEach(() => {
      vi.resetAllMocks();
      vi.spyOn(requestProcessor, "getSaleorHeaders").mockReturnValue(validHeaders);
    });

    it("Triggers JWKS refresh when initial auth data contains empty JWKS", async () => {
      vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockResolvedValue(undefined);
      vi.spyOn(mockAPL, "get").mockResolvedValue(authDataNoJwks);
      vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue("new-jwks");

      const validator = new SaleorWebhookValidator();

      const result = await validator.validateRequest({
        allowedEvent: "PRODUCT_UPDATED",
        apl: mockAPL,
        adapter,
        requestProcessor,
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

      expect(mockAPL.set).toHaveBeenCalledWith(
        expect.objectContaining({
          jwks: "new-jwks",
        }),
      );
      expect(fetchRemoteJwksModule.fetchRemoteJwks).toHaveBeenCalledWith(
        authDataNoJwks.saleorApiUrl,
      );
      // it's called only once because jwks was missing initially, so we skipped first validation
      expect(verifySignatureModule.verifySignatureWithJwks).toHaveBeenCalledTimes(1);
    });

    it("Triggers JWKS refresh when token signature doesn't match JWKS from existing auth data", async () => {
      vi.spyOn(verifySignatureModule, "verifySignatureWithJwks")
        .mockRejectedValueOnce(new Error("Signature verification failed")) // First: reject validation due to stale jwks
        .mockResolvedValueOnce(undefined); // Second: resolve validation because jwks is now correct

      vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue("new-jwks");

      const validator = new SaleorWebhookValidator();

      const result = await validator.validateRequest({
        allowedEvent: "PRODUCT_UPDATED",
        apl: mockAPL,
        adapter,
        requestProcessor,
      });

      console.error(result);

      expect(result).toMatchObject({
        result: "ok",
        context: expect.objectContaining({
          baseUrl: "https://example-app.com/api",
          event: "product_updated",
          payload: {},
          schemaVersion: null,
        }),
      });

      expect(mockAPL.set).toHaveBeenCalledWith(
        expect.objectContaining({
          jwks: "new-jwks",
        }),
      );
      expect(fetchRemoteJwksModule.fetchRemoteJwks).toHaveBeenCalledWith(
        authDataNoJwks.saleorApiUrl,
      );
      expect(verifySignatureModule.verifySignatureWithJwks).toHaveBeenCalledTimes(2);
    });

    it("Returns an error when new JWKS cannot be fetched", async () => {
      vi.spyOn(mockAPL, "get").mockResolvedValue(authDataNoJwks);
      vi.spyOn(verifySignatureModule, "verifySignatureWithJwks").mockRejectedValue(
        new Error("Initial verification failed"),
      );
      vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockRejectedValue(
        new Error("JWKS fetch failed"),
      );

      const validator = new SaleorWebhookValidator();

      const result = await validator.validateRequest({
        allowedEvent: "PRODUCT_UPDATED",
        apl: mockAPL,
        adapter,
        requestProcessor,
      });

      expect(result).toMatchObject({
        result: "failure",
        error: {
          errorType: "SIGNATURE_VERIFICATION_FAILED",
          message: "Fetching remote JWKS failed",
        },
      });
      expect(fetchRemoteJwksModule.fetchRemoteJwks).toHaveBeenCalledTimes(1);
    });

    it("Returns an error when signature doesn't match JWKS after re-fetching it", async () => {
      vi.spyOn(verifySignatureModule, "verifySignatureWithJwks")
        .mockRejectedValueOnce(new Error("Stale JWKS")) // First attempt fails
        .mockRejectedValueOnce(new Error("Fresh JWKS mismatch")); // Second attempt fails
      vi.spyOn(fetchRemoteJwksModule, "fetchRemoteJwks").mockResolvedValue("{}");

      const validator = new SaleorWebhookValidator();

      const result = await validator.validateRequest({
        allowedEvent: "PRODUCT_UPDATED",
        apl: mockAPL,
        adapter,
        requestProcessor,
      });

      expect(result).toMatchObject({
        result: "failure",
        error: {
          errorType: "SIGNATURE_VERIFICATION_FAILED",
          message: "Request signature check failed",
        },
      });

      expect(verifySignatureModule.verifySignatureWithJwks).toHaveBeenCalledTimes(2);
      expect(fetchRemoteJwksModule.fetchRemoteJwks).toHaveBeenCalledWith(
        authDataNoJwks.saleorApiUrl,
      );
    });
  });
});
