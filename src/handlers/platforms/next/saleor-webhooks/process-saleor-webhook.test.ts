import { NextApiRequest } from "next/types";
import { createMocks } from "node-mocks-http";
import rawBody from "raw-body";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockAPL } from "../../../test-utils/mock-apl";
import { processSaleorWebhook } from "./process-saleor-webhook";

vi.mock("../../../verify-signature", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifySignature: vi.fn((domain, signature) => {
    if (signature !== "mocked_signature") {
      throw new Error("Wrong signature");
    }
  }),
  verifySignatureFromApiUrl: vi.fn((domain, signature) => {
    if (signature !== "mocked_signature") {
      throw new Error("Wrong signature");
    }
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifySignatureWithJwks: vi.fn((jwks, signature, body) => {
    if (signature !== "mocked_signature") {
      throw new Error("Wrong signature");
    }
  }),
}));

vi.mock("raw-body", () => ({
  default: vi.fn().mockResolvedValue("{}"),
}));
describe("processAsyncSaleorWebhook", () => {
  let mockRequest: NextApiRequest;

  const mockAPL = new MockAPL();

  beforeEach(() => {
    // Create request method which passes all the tests
    const { req } = createMocks({
      headers: {
        host: "some-saleor-host.cloud",
        "x-forwarded-proto": "https",
        "saleor-domain": mockAPL.workingSaleorDomain,
        "saleor-api-url": mockAPL.workingSaleorApiUrl,
        "saleor-event": "product_updated",
        "saleor-signature": "mocked_signature",
        "content-length": "0", // is ignored by mocked raw-body.
      },
      method: "POST",
      // body can be skipped because we mock it with raw-body
    });
    mockRequest = req;
  });

  it("Process valid request", async () =>
    expect(() =>
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).not.toThrow());

  it("Throw error on non-POST request method", async () => {
    mockRequest.method = "GET";

    await expect(
      processSaleorWebhook({ req: mockRequest, apl: mockAPL, allowedEvent: "PRODUCT_UPDATED" })
    ).rejects.toThrow("Wrong request method");
  });

  it("Throw error on missing api url header", async () => {
    delete mockRequest.headers["saleor-api-url"];

    await expect(
      processSaleorWebhook({ req: mockRequest, apl: mockAPL, allowedEvent: "PRODUCT_UPDATED" })
    ).rejects.toThrow("Missing saleor-api-url header");
  });

  it("Throw error on missing event header", async () => {
    delete mockRequest.headers["saleor-event"];

    await expect(
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).rejects.toThrow("Missing saleor-event header");
  });

  it("Throw error on mismatched event header", async () => {
    mockRequest.headers["saleor-event"] = "different_event";
    await expect(
      processSaleorWebhook({ req: mockRequest, apl: mockAPL, allowedEvent: "PRODUCT_UPDATED" })
    ).rejects.toThrow("Wrong incoming request event: different_event. Expected: product_updated");
  });

  it("Throw error on missing signature header", async () => {
    delete mockRequest.headers["saleor-signature"];
    await expect(
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).rejects.toThrow("Missing saleor-signature header");
  });

  it("Throw error on missing request body", async () => {
    vi.mocked(rawBody).mockImplementationOnce(async () => {
      throw new Error("Missing request body");
    });

    await expect(
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).rejects.toThrow("Missing request body");
  });

  it("Throw error on not registered app", async () => {
    mockRequest.headers["saleor-api-url"] = "https://not-registered.example.com/graphql/";
    await expect(
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).rejects.toThrow(
      "Can't find auth data for https://not-registered.example.com/graphql/. Please register the application"
    );
  });

  it("Throw error on wrong signature", async () => {
    mockRequest.headers["saleor-signature"] = "wrong_signature";

    vi.mock("../../../fetch-remote-jwks", () => ({
      fetchRemoteJwks: vi.fn(async () => "wrong_signature"),
    }));

    return expect(
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).rejects.toThrow("Request signature check failed");
  });

  it("Fallback to null if version is missing on payload", async () => {
    await expect(
      processSaleorWebhook({
        req: mockRequest,
        apl: mockAPL,
        allowedEvent: "PRODUCT_UPDATED",
      })
    ).resolves.toStrictEqual({
      authData: {
        appId: "mock-app-id",
        domain: "example.com",
        jwks: "{}",
        saleorApiUrl: "https://example.com/graphql/",
        token: "mock-token",
      },
      baseUrl: "https://some-saleor-host.cloud",
      event: "product_updated",
      payload: {},
      schemaVersion: null,
    });
  });
});
