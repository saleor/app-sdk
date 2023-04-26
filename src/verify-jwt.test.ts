import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyJWT } from "./verify-jwt";

/**
 * exp field points to Nov 24, 2022
 */
const validToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6Ijk4ZTEzNDk4YmM5NThjM2QyNzk2NjY5Zjk0NzYxMzZkIn0.eyJpYXQiOjE2NjkxOTE4NDUsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiZGVtby5ldS5zYWxlb3IuY2xvdWQiLCJleHAiOjE2NjkyNzgyNDUsInRva2VuIjoic2JsRmVrWnVCSUdXIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInR5cGUiOiJ0aGlyZHBhcnR5IiwidXNlcl9pZCI6IlZYTmxjam95TWc9PSIsImlzX3N0YWZmIjp0cnVlLCJhcHAiOiJRWEJ3T2pJM05RPT0iLCJwZXJtaXNzaW9ucyI6W10sInVzZXJfcGVybWlzc2lvbnMiOlsiTUFOQUdFX1BBR0VfVFlQRVNfQU5EX0FUVFJJQlVURVMiLCJNQU5BR0VfUFJPRFVDVF9UWVBFU19BTkRfQVRUUklCVVRFUyIsIk1BTkFHRV9ESVNDT1VOVFMiLCJNQU5BR0VfUExVR0lOUyIsIk1BTkFHRV9TVEFGRiIsIk1BTkFHRV9QUk9EVUNUUyIsIk1BTkFHRV9TSElQUElORyIsIk1BTkFHRV9UUkFOU0xBVElPTlMiLCJNQU5BR0VfT0JTRVJWQUJJTElUWSIsIk1BTkFHRV9VU0VSUyIsIk1BTkFHRV9BUFBTIiwiTUFOQUdFX0NIQU5ORUxTIiwiTUFOQUdFX0dJRlRfQ0FSRCIsIkhBTkRMRV9QQVlNRU5UUyIsIklNUEVSU09OQVRFX1VTRVIiLCJNQU5BR0VfU0VUVElOR1MiLCJNQU5BR0VfUEFHRVMiLCJNQU5BR0VfTUVOVVMiLCJNQU5BR0VfQ0hFQ0tPVVRTIiwiSEFORExFX0NIRUNLT1VUUyIsIk1BTkFHRV9PUkRFUlMiXX0.PUyvuUlDvUBXMGSaexusdlkY5wF83M8tsjefVXOknaKuVgLbafvLOgx78YGVB4kdAybC7O3Yjs7IIFOzz5U80Q";

const validApiUrl = "https://demo.eu.saleor.cloud/graphql/";

const validAppId = "QXBwOjI3NQ==";

const mockedTodayDateBeforeTokenExp = new Date(2022, 10, 20);
const mockedTodayDateAfterTokenExp = new Date(2022, 10, 26);

describe("verifyJWT", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockedTodayDateBeforeTokenExp);

    vi.mock("jose", async () => {
      const original = await vi.importActual("jose");
      return {
        // @ts-ignore
        ...original,
        createRemoteJWKSet: vi.fn().mockImplementation(() => ""),
        jwtVerify: vi.fn().mockImplementation(() => ""),
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("Process valid request", async () => {
    await verifyJWT({ appId: validAppId, saleorApiUrl: validApiUrl, token: validToken });
  });

  it("Throw error on decode issue", async () => {
    await expect(
      verifyJWT({ appId: validAppId, saleorApiUrl: validApiUrl, token: "wrong_token" })
    ).rejects.toThrow("JWT verification failed: Could not decode authorization token.");
  });

  it("Throw error on app ID missmatch", async () => {
    await expect(
      verifyJWT({ appId: "wrong_id", saleorApiUrl: validApiUrl, token: validToken })
    ).rejects.toThrow("JWT verification failed: Token's app property is different than app ID.");
  });

  it("Throw error on user missing the permissions", async () => {
    await expect(
      verifyJWT({
        appId: validAppId,
        saleorApiUrl: validApiUrl,
        token: validToken,
        requiredPermissions: ["HANDLE_TAXES"],
      })
    ).rejects.toThrow("JWT verification failed: Token's permissions are not sufficient.");
  });

  it("Throws if today date is newer than token expiration", async () => {
    vi.setSystemTime(mockedTodayDateAfterTokenExp);

    await expect(
      verifyJWT({
        appId: validAppId,
        saleorApiUrl: validApiUrl,
        token: validToken,
      })
    ).rejects.toThrow("JWT verification failed: Token is expired");
  });
});
