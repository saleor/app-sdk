import { NextApiRequest } from "next/types";
import { createMocks } from "node-mocks-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { APL } from "../../APL";
import { getAppId } from "../../get-app-id";
import { verifyJWT } from "../../verify-jwt";
import { processSaleorProtectedHandler } from "./process-protected-handler";

const validToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6Ijk4ZTEzNDk4YmM5NThjM2QyNzk2NjY5Zjk0NzYxMzZkIn0.eyJpYXQiOjE2NjkxOTE4NDUsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiZGVtby5ldS5zYWxlb3IuY2xvdWQiLCJleHAiOjE2NjkyNzgyNDUsInRva2VuIjoic2JsRmVrWnVCSUdXIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInR5cGUiOiJ0aGlyZHBhcnR5IiwidXNlcl9pZCI6IlZYTmxjam95TWc9PSIsImlzX3N0YWZmIjp0cnVlLCJhcHAiOiJRWEJ3T2pJM05RPT0iLCJwZXJtaXNzaW9ucyI6W10sInVzZXJfcGVybWlzc2lvbnMiOlsiTUFOQUdFX1BBR0VfVFlQRVNfQU5EX0FUVFJJQlVURVMiLCJNQU5BR0VfUFJPRFVDVF9UWVBFU19BTkRfQVRUUklCVVRFUyIsIk1BTkFHRV9ESVNDT1VOVFMiLCJNQU5BR0VfUExVR0lOUyIsIk1BTkFHRV9TVEFGRiIsIk1BTkFHRV9QUk9EVUNUUyIsIk1BTkFHRV9TSElQUElORyIsIk1BTkFHRV9UUkFOU0xBVElPTlMiLCJNQU5BR0VfT0JTRVJWQUJJTElUWSIsIk1BTkFHRV9VU0VSUyIsIk1BTkFHRV9BUFBTIiwiTUFOQUdFX0NIQU5ORUxTIiwiTUFOQUdFX0dJRlRfQ0FSRCIsIkhBTkRMRV9QQVlNRU5UUyIsIklNUEVSU09OQVRFX1VTRVIiLCJNQU5BR0VfU0VUVElOR1MiLCJNQU5BR0VfUEFHRVMiLCJNQU5BR0VfTUVOVVMiLCJNQU5BR0VfQ0hFQ0tPVVRTIiwiSEFORExFX0NIRUNLT1VUUyIsIk1BTkFHRV9PUkRFUlMiXX0.PUyvuUlDvUBXMGSaexusdlkY5wF83M8tsjefVXOknaKuVgLbafvLOgx78YGVB4kdAybC7O3Yjs7IIFOzz5U80Q";

const validAppId = "QXBwOjI3NQ==";

vi.mock("./../../get-app-id", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAppId: vi.fn(),
}));

vi.mock("./../../verify-jwt", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyJWT: vi.fn(),
}));

describe("processSaleorProtectedHandler", () => {
  let mockRequest: NextApiRequest;

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

  beforeEach(() => {
    // Create request method which passes all the tests
    const { req } = createMocks({
      headers: {
        host: "some-saleor-host.cloud",
        "x-forwarded-proto": "https",
        "saleor-domain": "example.com",
        "saleor-event": "product_updated",
        "saleor-signature": "mocked_signature",
        "authorization-bearer": validToken,
      },
      method: "POST",
    });
    mockRequest = req;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Process valid request", async () => {
    vi.mocked(getAppId).mockResolvedValue(validAppId);
    vi.mocked(verifyJWT).mockResolvedValue();

    expect(await processSaleorProtectedHandler({ apl: mockAPL, req: mockRequest })).toStrictEqual({
      authData: {
        domain: "example.com",
        token: "mock-token",
      },
      baseUrl: "https://some-saleor-host.cloud",
    });
  });

  it("Throw error when app ID can't be fetched", async () => {
    vi.mocked(getAppId).mockResolvedValue("");

    await expect(processSaleorProtectedHandler({ apl: mockAPL, req: mockRequest })).rejects.toThrow(
      "Could not get the app ID from the domain example.com"
    );
  });

  it("Throw error when domain header is missing", async () => {
    vi.mocked(getAppId).mockResolvedValue(validAppId);
    vi.mocked(verifyJWT).mockResolvedValue();

    delete mockRequest.headers["saleor-domain"];

    await expect(processSaleorProtectedHandler({ apl: mockAPL, req: mockRequest })).rejects.toThrow(
      "Missing saleor-domain header"
    );
  });

  it("Throw error when token header is missing", async () => {
    vi.mocked(getAppId).mockResolvedValue(validAppId);
    vi.mocked(verifyJWT).mockResolvedValue();

    delete mockRequest.headers["authorization-bearer"];

    await expect(processSaleorProtectedHandler({ apl: mockAPL, req: mockRequest })).rejects.toThrow(
      "Missing authorization-bearer header"
    );
  });

  it("Throw error when APL has no auth data for the given domain", async () => {
    vi.mocked(getAppId).mockResolvedValue(validAppId);
    vi.mocked(verifyJWT).mockResolvedValue();

    mockRequest.headers["saleor-domain"] = "wrong.example.com";

    await expect(processSaleorProtectedHandler({ apl: mockAPL, req: mockRequest })).rejects.toThrow(
      "Can't find auth data for domain wrong.example.com. Please register the application"
    );
  });

  it("Throw error when token verification fails", async () => {
    vi.mocked(getAppId).mockResolvedValue(validAppId);
    vi.mocked(verifyJWT).mockRejectedValue("Verification error");

    await expect(processSaleorProtectedHandler({ apl: mockAPL, req: mockRequest })).rejects.toThrow(
      "JWT verification failed: "
    );
  });
});
