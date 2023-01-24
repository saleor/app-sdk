import { describe, expect, it } from "vitest";

import { hasPermissionsInJwtToken } from "./has-permissions-in-jwt-token";
import { DashboardTokenPayload } from "./verify-jwt";

describe("hasPermissionsInJwtToken", () => {
  it("Pass if no required permissions, and user has none", async () => {
    const tokenData: Pick<DashboardTokenPayload, "user_permissions"> = {
      user_permissions: [],
    };
    await expect(hasPermissionsInJwtToken(tokenData)).toBeTruthy();
  });

  it("Pass if no required permissions", async () => {
    const tokenData: Pick<DashboardTokenPayload, "user_permissions"> = {
      user_permissions: ["MANAGE_ORDERS"],
    };
    await expect(hasPermissionsInJwtToken(tokenData)).toBeTruthy();
  });

  it("Pass if user has assigned required permissions", async () => {
    const tokenData: Pick<DashboardTokenPayload, "user_permissions"> = {
      user_permissions: ["MANAGE_ORDERS", "MANAGE_CHECKOUTS", "HANDLE_TAXES"],
    };
    await expect(
      hasPermissionsInJwtToken(tokenData, ["MANAGE_ORDERS", "MANAGE_CHECKOUTS"])
    ).toBeTruthy();
  });

  it("Reject if user is missing any of required permissions", async () => {
    const tokenData: Pick<DashboardTokenPayload, "user_permissions"> = {
      user_permissions: ["MANAGE_ORDERS", "HANDLE_TAXES"],
    };
    await expect(
      hasPermissionsInJwtToken(tokenData, ["MANAGE_ORDERS", "MANAGE_CHECKOUTS"])
    ).toBeFalsy();
  });

  it("Reject if user is missing permission data", async () => {
    const tokenData: Pick<DashboardTokenPayload, "user_permissions"> = {
      user_permissions: [],
    };
    await expect(
      hasPermissionsInJwtToken(tokenData, ["MANAGE_ORDERS", "MANAGE_CHECKOUTS"])
    ).toBeFalsy();
  });
});
