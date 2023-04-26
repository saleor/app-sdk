import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardTokenPayload } from "./verify-jwt";
import { verifyTokenExpiration } from "./verify-token-expiration";

describe("verifyTokenExpiration", () => {
  const mockTodayDate = new Date(2020, 2, 1, 9, 0, 0);

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(mockTodayDate);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("Passes if exp field in token is in the future from \"now\"", () => {
    const tokenDate = new Date(2020, 2, 1, 12, 0, 0);

    expect(() =>
      verifyTokenExpiration({
        /**
         * Must be seconds
         */
        exp: tokenDate.valueOf() / 1000,
      } as DashboardTokenPayload)
    ).not.toThrow();
  });

  it("Throws if exp field is missing", () => {
    expect(() => verifyTokenExpiration({} as DashboardTokenPayload)).toThrow();
  });

  it("Throws if exp field is older than today", () => {
    const tokenDate = new Date(2020, 2, 1, 4, 0, 0);

    expect(() =>
      verifyTokenExpiration({
        /**
         * Must be seconds
         */
        exp: tokenDate.valueOf() / 1000,
      } as DashboardTokenPayload)
    ).toThrow();
  });

  it("Throws if exp field is the same as today", () => {
    expect(() =>
      verifyTokenExpiration({
        /**
         * Must be seconds
         */
        exp: mockTodayDate.valueOf() / 1000,
      } as DashboardTokenPayload)
    ).toThrow();
  });
});
