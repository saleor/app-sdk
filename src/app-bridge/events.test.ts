import { describe, expect, it } from "vitest";

import { DashboardEventFactory } from "./events";

describe("DashboardEventFactory", () => {
  it("Creates handshake event", () => {
    expect(
      DashboardEventFactory.createHandshakeEvent("mock-token", 1, {
        dashboard: "3.15.3",
        core: "3.15.1",
      })
    ).toEqual({
      payload: {
        token: "mock-token",
        version: 1,
        saleorVersion: "3.15.1",
        dashboardVersion: "3.15.3",
      },
      type: "handshake",
    });
  });

  it("Creates redirect event", () => {
    expect(DashboardEventFactory.createRedirectEvent("/new-path")).toEqual({
      payload: {
        path: "/new-path",
      },
      type: "redirect",
    });
  });

  it("Creates dispatch response event", () => {
    expect(DashboardEventFactory.createDispatchResponseEvent("123", true)).toEqual({
      payload: {
        actionId: "123",
        ok: true,
      },
      type: "response",
    });
  });

  it("Creates theme change event", () => {
    expect(DashboardEventFactory.createThemeChangeEvent("light")).toEqual({
      payload: {
        theme: "light",
      },
      type: "theme",
    });
  });

  it("Creates locale change event", () => {
    expect(DashboardEventFactory.createLocaleChangedEvent("it")).toEqual({
      payload: {
        locale: "it",
      },
      type: "localeChanged",
    });
  });

  it("Creates token refresh event", () => {
    expect(DashboardEventFactory.createTokenRefreshEvent("TOKEN")).toEqual({
      payload: {
        token: "TOKEN",
      },
      type: "tokenRefresh",
    });
  });
});
