import { fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppBridge } from "./app-bridge";
import { AppBridgeProvider, useAppBridge } from "./app-bridge-provider";
import { DashboardEventFactory } from "./events";

const origin = "http://example.com";
const domain = "saleor.domain.host";

Object.defineProperty(window.document, "referrer", {
  value: origin,
  writable: true,
});

Object.defineProperty(window, "location", {
  value: {
    href: `${origin}?domain=${domain}&id=appid`,
  },
  writable: true,
});

describe("AppBridgeProvider", () => {
  it("Mounts provider in React DOM", () => {
    const { container } = render(
      <AppBridgeProvider>
        <div />
      </AppBridgeProvider>
    );

    expect(container).toBeDefined();
  });

  it("Mounts provider in React DOM with provided AppBridge instance", () => {
    const { container } = render(
      <AppBridgeProvider
        appBridgeInstance={
          new AppBridge({
            targetDomain: "https://test-domain",
          })
        }
      >
        <div />
      </AppBridgeProvider>
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

    const mockConsoleError = vi.spyOn(console, "error");
    /**
     * Silent errors
     */
    mockConsoleError.mockImplementation(() => {
      // Silence
    });

    let appBridgeResult: AppBridge | undefined;

    try {
      const { result } = renderHook(() => useAppBridge(), {});
      appBridgeResult = result.current.appBridge;

      mockConsoleError.mockClear();
    } catch (e) {
      expect(mockConsoleError).toHaveBeenCalled();
      expect(appBridgeResult).toBeUndefined();
    }

    mockConsoleError.mockClear();
  });

  it("Returned instance provided in Provider", () => {
    const appBridge = new AppBridge({
      targetDomain: "test-domain",
    });

    const { result } = renderHook(() => useAppBridge(), {
      wrapper: (props: {}) => <AppBridgeProvider {...props} appBridgeInstance={appBridge} />,
    });

    expect(result.current.appBridge?.getState().domain).toBe("test-domain");
  });

  it("Stores active state in React State", () => {
    const appBridge = new AppBridge({
      targetDomain: origin,
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
      </AppBridgeProvider>
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createThemeChangeEvent("light"),
        origin,
      })
    );

    return waitFor(() => {
      expect(renderCallback).toHaveBeenCalledTimes(2);
      expect(renderCallback).toHaveBeenCalledWith({
        domain: "http://example.com",
        id: "appid",
        path: "",
        ready: false,
        theme: "light",
      });
    });
  });
});
