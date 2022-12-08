import { describe, expect, it, vi } from "vitest";

import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "../const";
import { AppBridge } from "./app-bridge";
import { AppBridgeState } from "./app-bridge-state";
import { createAuthenticatedFetch } from "./fetch";

describe("createAuthenticatedFetch", () => {
  const mockedAppBridge: Pick<AppBridge, "getState"> = {
    getState(): AppBridgeState {
      return {
        domain: "master.staging.saleor.cloud",
        token: "XXX_YYY",
        locale: "pl",
        path: "/",
        ready: true,
        theme: "light",
        saleorApiUrl: "https://master.staging.saleor.cloud/graphql/",
        id: "xyz1234",
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

    expect((fetchCallHeaders as Headers).get(SALEOR_DOMAIN_HEADER)).toBe(
      "master.staging.saleor.cloud"
    );
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

    expect((fetchCallHeaders as Headers).get(SALEOR_DOMAIN_HEADER)).toBe(
      "master.staging.saleor.cloud"
    );
    expect((fetchCallHeaders as Headers).get(SALEOR_AUTHORIZATION_BEARER_HEADER)).toBe("XXX_YYY");
    expect((fetchCallHeaders as Headers).get("foo")).toBe("bar");
  });
});
