import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppBridge } from "./app-bridge";
import { AppBridgeProvider, useAppBridge, useReactiveAppBridge } from "./app-bridge-provider";
import { DashboardEventFactory } from "./events";

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

    expect(result.current.app).toBeDefined();
  });

  /**
   * TODO - How to write this test and avoid logging bloated error to console?
   */
  it.todo("Throws if not wrapped inside AppBridgeProvider");

  it("Returned instance provided in Provider", () => {
    const appBridge = new AppBridge({
      targetDomain: "test-domain",
    });

    const { result } = renderHook(() => useAppBridge(), {
      wrapper: (props: any) => <AppBridgeProvider {...props} appBridgeInstance={appBridge} />,
    });

    expect(result.current.app?.getState().domain).toBe("test-domain");
  });
});

describe("useReactiveAppBridge hook", () => {
  /**
   * TODO: Make this test work
   */
  it.fails("Rerenders component that is connected to on message received", async () => {
    const renderCallback = vi.fn();

    function TestComponent() {
      useReactiveAppBridge();

      renderCallback("render");

      return null;
    }

    render(
      <AppBridgeProvider
        appBridgeInstance={
          new AppBridge({
            targetDomain: "http://localhost:1234",
          })
        }
      >
        <TestComponent />
      </AppBridgeProvider>
    );

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createThemeChangeEvent("dark"),
        origin: "http://localhost:1234",
      })
    );

    expect(renderCallback).toHaveBeenCalledTimes(2);
  });
});
