import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@/headers";

import { AppBridge } from "./app-bridge";
import { useAppBridge } from "./app-bridge-provider";
import { AppBridgeState } from "./app-bridge-state";
import { createAuthenticatedFetch, useAuthenticatedFetch } from "./fetch";

vi.mock("./app-bridge-provider", () => ({
  useAppBridge: vi.fn(),
}));

describe("createAuthenticatedFetch", () => {
  const mockedAppBridge: Pick<AppBridge, "getState"> = {
    getState(): AppBridgeState {
      return {
        token: "XXX_YYY",
        locale: "pl",
        path: "/",
        ready: true,
        theme: "light",
        saleorApiUrl: "https://master.staging.saleor.cloud/graphql/",
        id: "xyz1234",
        formContext: {},
      };
    },
  };

  it("Decorates request headers with AppBridge headers", async () => {
    const spiedFetch = vi.spyOn(global, "fetch");

    const fetchFn = createAuthenticatedFetch(mockedAppBridge);

    try {
      await fetchFn("/api/test");
    } catch (e) {
      // ignore
    }

    const fetchCallArguments = spiedFetch.mock.lastCall;
    const fetchCallHeaders = fetchCallArguments![1]?.headers;

    expect((fetchCallHeaders as Headers).get(SALEOR_AUTHORIZATION_BEARER_HEADER)).toBe("XXX_YYY");
  });

  it("Extends existing fetch config", async () => {
    const spiedFetch = vi.spyOn(global, "fetch");

    const fetchFn = createAuthenticatedFetch(mockedAppBridge);

    try {
      await fetchFn("/api/test", {
        headers: {
          foo: "bar",
        },
      });
    } catch (e) {
      // ignore
    }

    const fetchCallArguments = spiedFetch.mock.lastCall;
    const fetchCallHeaders = fetchCallArguments![1]?.headers;

    expect((fetchCallHeaders as Headers).get(SALEOR_AUTHORIZATION_BEARER_HEADER)).toBe("XXX_YYY");
    expect((fetchCallHeaders as Headers).get("foo")).toBe("bar");
  });

  it("Sets empty header values when token and saleorApiUrl are missing from state", async () => {
    const spiedFetch = vi.spyOn(global, "fetch");
    const emptyStateAppBridge: Pick<AppBridge, "getState"> = {
      getState: () => ({}) as AppBridgeState,
    };

    const fetchFn = createAuthenticatedFetch(emptyStateAppBridge);

    try {
      await fetchFn("/api/test");
    } catch (e) {
      // ignore
    }

    const fetchCallHeaders = spiedFetch.mock.lastCall![1]?.headers as Headers;
    expect(fetchCallHeaders.get(SALEOR_AUTHORIZATION_BEARER_HEADER)).toBe("");
    expect(fetchCallHeaders.get(SALEOR_API_URL_HEADER)).toBe("");
  });
});

describe("useAuthenticatedFetch", () => {
  const mockedAppBridge: Pick<AppBridge, "getState"> = {
    getState: () =>
      ({
        token: "XXX_YYY",
        saleorApiUrl: "https://master.staging.saleor.cloud/graphql/",
      }) as AppBridgeState,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a decorated fetch when AppBridge is available", async () => {
    vi.mocked(useAppBridge).mockReturnValue({
      appBridge: mockedAppBridge as AppBridge,
    } as ReturnType<typeof useAppBridge>);

    const customFetch = vi.fn().mockResolvedValue(new Response("ok"));

    const { result } = renderHook(() => useAuthenticatedFetch(customFetch));
    await result.current("/api/test");

    const headers = customFetch.mock.lastCall![1]?.headers as Headers;
    expect(headers.get(SALEOR_AUTHORIZATION_BEARER_HEADER)).toBe("XXX_YYY");
    expect(headers.get(SALEOR_API_URL_HEADER)).toBe("https://master.staging.saleor.cloud/graphql/");
  });

  it("throws when used outside of AppBridge context", () => {
    vi.mocked(useAppBridge).mockReturnValue({
      appBridge: undefined,
    } as ReturnType<typeof useAppBridge>);

    expect(() => renderHook(() => useAuthenticatedFetch())).toThrow(
      "useAuthenticatedFetch can be used only in browser context",
    );
  });
});
