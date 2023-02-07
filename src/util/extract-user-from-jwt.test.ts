import { describe, expect, it } from "vitest";

import { extractUserFromJwt } from "./extract-user-from-jwt";

const validJwtToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6Ijk4ZTEzNDk4YmM5NThjM2QyNzk2NjY5Zjk0NzYxMzZkIn0.eyJpYXQiOjE2NjkxOTE4NDUsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiZGVtby5ldS5zYWxlb3IuY2xvdWQiLCJleHAiOjE2NjkyNzgyNDUsInRva2VuIjoic2JsRmVrWnVCSUdXIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInR5cGUiOiJ0aGlyZHBhcnR5IiwidXNlcl9pZCI6IlZYTmxjam95TWc9PSIsImlzX3N0YWZmIjp0cnVlLCJhcHAiOiJRWEJ3T2pJM05RPT0iLCJwZXJtaXNzaW9ucyI6W10sInVzZXJfcGVybWlzc2lvbnMiOlsiTUFOQUdFX1BBR0VfVFlQRVNfQU5EX0FUVFJJQlVURVMiLCJNQU5BR0VfUFJPRFVDVF9UWVBFU19BTkRfQVRUUklCVVRFUyIsIk1BTkFHRV9ESVNDT1VOVFMiLCJNQU5BR0VfUExVR0lOUyIsIk1BTkFHRV9TVEFGRiIsIk1BTkFHRV9QUk9EVUNUUyIsIk1BTkFHRV9TSElQUElORyIsIk1BTkFHRV9UUkFOU0xBVElPTlMiLCJNQU5BR0VfT0JTRVJWQUJJTElUWSIsIk1BTkFHRV9VU0VSUyIsIk1BTkFHRV9BUFBTIiwiTUFOQUdFX0NIQU5ORUxTIiwiTUFOQUdFX0dJRlRfQ0FSRCIsIkhBTkRMRV9QQVlNRU5UUyIsIklNUEVSU09OQVRFX1VTRVIiLCJNQU5BR0VfU0VUVElOR1MiLCJNQU5BR0VfUEFHRVMiLCJNQU5BR0VfTUVOVVMiLCJNQU5BR0VfQ0hFQ0tPVVRTIiwiSEFORExFX0NIRUNLT1VUUyIsIk1BTkFHRV9PUkRFUlMiXX0.PUyvuUlDvUBXMGSaexusdlkY5wF83M8tsjefVXOknaKuVgLbafvLOgx78YGVB4kdAybC7O3Yjs7IIFOzz5U80Q";

const invalidToken = "foo";

describe("extractUserFromJwt", () => {
  it("Throws if token is invalid", () => {
    expect(() => extractUserFromJwt(invalidToken)).toThrow();
  });

  it("Extracts email and user permissions from the token", () => {
    expect(extractUserFromJwt(validJwtToken)).toEqual({
      email: "admin@example.com",
      userPermissions: [
        "MANAGE_PAGE_TYPES_AND_ATTRIBUTES",
        "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
        "MANAGE_DISCOUNTS",
        "MANAGE_PLUGINS",
        "MANAGE_STAFF",
        "MANAGE_PRODUCTS",
        "MANAGE_SHIPPING",
        "MANAGE_TRANSLATIONS",
        "MANAGE_OBSERVABILITY",
        "MANAGE_USERS",
        "MANAGE_APPS",
        "MANAGE_CHANNELS",
        "MANAGE_GIFT_CARD",
        "HANDLE_PAYMENTS",
        "IMPERSONATE_USER",
        "MANAGE_SETTINGS",
        "MANAGE_PAGES",
        "MANAGE_MENUS",
        "MANAGE_CHECKOUTS",
        "HANDLE_CHECKOUTS",
        "MANAGE_ORDERS",
      ],
    });
  });
});
