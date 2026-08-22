import { fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppBridge } from "./app-bridge";
import { AppBridgeProvider, useAppBridge } from "./app-bridge-provider";
import { AppIframeParams } from "./app-iframe-params";
import { DashboardEventFactory } from "./events";

const origin = "http://example.com";
const domain = "saleor.domain.host";
const saleorApiUrl = "https://saleor.domain.host/graphql/";

Object.defineProperty(window.document, "referrer", {
  value: origin,
  writable: true,
});

Object.defineProperty(window, "location", {
  value: {
    href: `${origin}?${AppIframeParams.DOMAIN}=${domain}&${AppIframeParams.APP_ID}=appid&${AppIframeParams.SALEOR_API_URL}=${saleorApiUrl}`,
  },
  writable: true,
});

describe("AppBridgeProvider", () => {
  it("Destroys the AppBridge it created when unmounted", () => {
    const { unmount } = render(
      <AppBridgeProvider>
        <div />
      </AppBridgeProvider>,
    );

    const postMessage = vi.spyOn(window.parent, "postMessage");

    unmount();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createShortcutsChangedEvent([
          { id: "commandPalette.open", key: "k", metaKey: true },
        ]),
        origin,
      }),
    );

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(postMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "triggerShortcut" }),
      "*",
    );

    postMessage.mockRestore();
  });

  it("Keeps an AppBridge passed via props alive after unmount", () => {
    const appBridge = new AppBridge({
      saleorApiUrl,
      autoNotifyReady: false,
      forwardKeyboardShortcuts: false,
    });

    const { unmount } = render(
      <AppBridgeProvider appBridgeInstance={appBridge}>
        <div />
      </AppBridgeProvider>,
    );

    unmount();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createThemeChangeEvent("dark"),
        origin,
      }),
    );

    expect(appBridge.getState().theme).toBe("dark");

    appBridge.destroy();
  });

  it("Mounts provider in React DOM", () => {
    const { container } = render(
      <AppBridgeProvider>
        <div />
      </AppBridgeProvider>,
    );

    expect(container).toBeDefined();
  });

  it("Mounts provider in React DOM with provided AppBridge instance", () => {
    const { container } = render(
      <AppBridgeProvider
        appBridgeInstance={
          new AppBridge({
            saleorApiUrl,
          })
        }
      >
        <div />
      </AppBridgeProvider>,
    );

    expect(container).toBeDefined();
  });
});

describe("useAppBridge hook", () => {
  it("App is defined when wrapped in AppBridgeProvider", async () => {
    const { result } = renderHook(() => useAppBridge(), {
      wrapper: AppBridgeProvider,
    });

    expect(result.current.appBridge).toBeDefined();
  });

  it("Throws if not wrapped inside AppBridgeProvider", () => {
    expect.assertions(2);

    let appBridgeResult: AppBridge | undefined;

    try {
      const { result } = renderHook(() => useAppBridge());
      appBridgeResult = result.current.appBridge;
    } catch (e) {
      expect(e).toEqual(Error("useAppBridge used outside of AppBridgeProvider"));
      expect(appBridgeResult).toBeUndefined();
    }
  });

  it("Returned instance provided in Provider", () => {
    const appBridge = new AppBridge({
      saleorApiUrl,
    });

    const { result } = renderHook(() => useAppBridge(), {
      wrapper: (props: {}) => <AppBridgeProvider {...props} appBridgeInstance={appBridge} />,
    });

    expect(result.current.appBridge?.getState().saleorApiUrl).toBe(saleorApiUrl);
  });

  it("Stores active state in React State", () => {
    const appBridge = new AppBridge({
      saleorApiUrl,
    });

    const renderCallback = vi.fn();

    function TestComponent() {
      const { appBridgeState } = useAppBridge();

      renderCallback(appBridgeState);

      return null;
    }

    render(
      <AppBridgeProvider appBridgeInstance={appBridge}>
        <TestComponent />
      </AppBridgeProvider>,
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createThemeChangeEvent("light"),
        origin,
      }),
    );

    return waitFor(() => {
      expect(renderCallback).toHaveBeenCalledTimes(2);
      expect(renderCallback).toHaveBeenCalledWith({
        id: "appid",
        path: "",
        ready: false,
        theme: "light",
        locale: "en",
        saleorApiUrl,
        formContext: {},
        dashboardShortcuts: [],
      });
    });
  });

  it("Updates React state when shortcutsChanged is received", () => {
    const appBridge = new AppBridge({
      saleorApiUrl,
      forwardKeyboardShortcuts: false,
    });
    const renderCallback = vi.fn();

    function TestComponent() {
      const { appBridgeState } = useAppBridge();

      renderCallback(appBridgeState);

      return null;
    }

    render(
      <AppBridgeProvider appBridgeInstance={appBridge}>
        <TestComponent />
      </AppBridgeProvider>,
    );

    const shortcuts = [{ id: "commandPalette.open", key: "k", metaKey: true }];

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createShortcutsChangedEvent(shortcuts),
        origin,
      }),
    );

    return waitFor(() => {
      expect(renderCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          dashboardShortcuts: shortcuts,
        }),
      );
    });
  });
});
