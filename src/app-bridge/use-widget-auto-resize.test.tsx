import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWidgetAutoResize } from "./use-widget-auto-resize";
import { WIDGET_RESIZE_MESSAGE } from "./widget-resize";

vi.mock("./app-bridge-provider", () => ({
  useAppBridge: () => ({
    appBridge: undefined,
    appBridgeState: { ready: true },
  }),
}));

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  callback: ResizeObserverCallback;

  observe = vi.fn();

  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }

  static reset() {
    ResizeObserverMock.instances = [];
  }
}

const flushAnimationFrame = async () => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

describe("useWidgetAutoResize", () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ResizeObserverMock.reset();
    postMessageSpy = vi.fn();

    Object.defineProperty(window, "parent", {
      configurable: true,
      value: { postMessage: postMessageSpy },
    });

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    Object.defineProperty(window, "parent", {
      configurable: true,
      value: window,
    });
    vi.unstubAllGlobals();
  });

  it("reports the root height on mount", async () => {
    // Arrange
    const root = document.createElement("div");
    root.getBoundingClientRect = () =>
      ({
        height: 180,
      }) as DOMRect;
    Object.defineProperty(root, "scrollHeight", {
      configurable: true,
      value: 180,
    });
    document.body.appendChild(root);

    const rootRef = createRef<HTMLDivElement>();
    rootRef.current = root;

    // Act
    renderHook(() => useWidgetAutoResize(rootRef));
    await flushAnimationFrame();

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith({ type: WIDGET_RESIZE_MESSAGE, height: 180 }, "*");

    root.remove();
  });

  it("observes only the widget root element", () => {
    // Arrange
    const root = document.createElement("div");
    document.body.appendChild(root);

    const rootRef = createRef<HTMLDivElement>();
    rootRef.current = root;

    // Act
    renderHook(() => useWidgetAutoResize(rootRef));

    // Assert
    expect(ResizeObserverMock.instances).toHaveLength(1);
    expect(ResizeObserverMock.instances[0]?.observe).toHaveBeenCalledWith(root);
    expect(ResizeObserverMock.instances[0]?.observe).not.toHaveBeenCalledWith(
      document.documentElement,
    );

    root.remove();
  });

  it("reports height again when ResizeObserver fires", async () => {
    // Arrange
    const root = document.createElement("div");
    root.getBoundingClientRect = () =>
      ({
        height: 260,
      }) as DOMRect;
    Object.defineProperty(root, "scrollHeight", {
      configurable: true,
      value: 260,
    });
    document.body.appendChild(root);

    const rootRef = createRef<HTMLDivElement>();
    rootRef.current = root;

    renderHook(() => useWidgetAutoResize(rootRef));
    await flushAnimationFrame();
    postMessageSpy.mockClear();

    // Act
    ResizeObserverMock.instances[0]?.trigger();
    await flushAnimationFrame();

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith({ type: WIDGET_RESIZE_MESSAGE, height: 260 }, "*");

    root.remove();
  });

  it("does not observe when disabled", () => {
    // Arrange
    const root = document.createElement("div");
    const rootRef = createRef<HTMLDivElement>();
    rootRef.current = root;

    // Act
    renderHook(() => useWidgetAutoResize(rootRef, false));

    // Assert
    expect(ResizeObserverMock.instances).toHaveLength(0);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it("disconnects the observer on unmount", () => {
    // Arrange
    const root = document.createElement("div");
    const rootRef = createRef<HTMLDivElement>();
    rootRef.current = root;

    const { unmount } = renderHook(() => useWidgetAutoResize(rootRef));

    // Act
    unmount();

    // Assert
    expect(ResizeObserverMock.instances[0]?.disconnect).toHaveBeenCalled();
  });
});
