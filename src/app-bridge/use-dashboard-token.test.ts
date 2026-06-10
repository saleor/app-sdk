import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAppBridge } from "./app-bridge-provider";
import { useDashboardToken } from "./use-dashboard-token";

vi.mock("./app-bridge-provider", () => ({
  useAppBridge: vi.fn(),
}));

// JWT with payload { "app": "app-id" } — decodeJwt does not verify the signature.
const VALID_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhcHAiOiJhcHAtaWQifQ.signature";

const mockUseAppBridge = (token: string | undefined) => {
  vi.mocked(useAppBridge).mockReturnValue({
    appBridgeState: token ? { token } : {},
  } as ReturnType<typeof useAppBridge>);
};

describe("useDashboardToken", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("decodes claims and marks the token valid when a well-formed token is present", () => {
    mockUseAppBridge(VALID_TOKEN);

    const { result } = renderHook(() => useDashboardToken());

    expect(result.current.hasAppToken).toBe(true);
    expect(result.current.isTokenValid).toBe(true);
    expect(result.current.tokenClaims).toEqual({ app: "app-id" });
  });

  it("reports no token when the bridge state has no token", () => {
    mockUseAppBridge(undefined);

    const { result } = renderHook(() => useDashboardToken());

    expect(result.current.hasAppToken).toBe(false);
    expect(result.current.isTokenValid).toBe(false);
    expect(result.current.tokenClaims).toBeNull();
  });

  it("treats a malformed token as invalid without throwing", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockUseAppBridge("not-a-jwt");

    const { result } = renderHook(() => useDashboardToken());

    expect(result.current.hasAppToken).toBe(true);
    expect(result.current.isTokenValid).toBe(false);
    expect(result.current.tokenClaims).toBeNull();
  });
});
