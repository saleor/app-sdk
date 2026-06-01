import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWidgetAutoResize } from "./use-widget-auto-resize";
import { WIDGET_RESIZE_MESSAGE } from "./widget-resize";

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

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 180,
    });
    Object.defineProperty(document.body, "scrollHeight", {
      configurable: true,
      value: 180,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "parent", {
      configurable: true,
      value: window,
    });
    vi.unstubAllGlobals();
  });

  it("reports height on mount", () => {
    // Arrange & Act
    renderHook(() => useWidgetAutoResize());

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith({ type: WIDGET_RESIZE_MESSAGE, height: 180 }, "*");
  });

  it("observes documentElement and the target element", () => {
    // Arrange
    const target = document.createElement("div");
    document.body.appendChild(target);

    // Act
    renderHook(() => useWidgetAutoResize({ target }));

    // Assert
    expect(ResizeObserverMock.instances).toHaveLength(1);
    expect(ResizeObserverMock.instances[0]?.observe).toHaveBeenCalledWith(document.documentElement);
    expect(ResizeObserverMock.instances[0]?.observe).toHaveBeenCalledWith(target);

    target.remove();
  });

  it("reports height again when ResizeObserver fires", () => {
    // Arrange
    renderHook(() => useWidgetAutoResize());
    postMessageSpy.mockClear();

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 260,
    });
    Object.defineProperty(document.body, "scrollHeight", {
      configurable: true,
      value: 260,
    });

    // Act
    ResizeObserverMock.instances[0]?.trigger();

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith({ type: WIDGET_RESIZE_MESSAGE, height: 260 }, "*");
  });

  it("disconnects the observer on unmount", () => {
    // Arrange
    const { unmount } = renderHook(() => useWidgetAutoResize());

    // Act
    unmount();

    // Assert
    expect(ResizeObserverMock.instances[0]?.disconnect).toHaveBeenCalled();
  });
});
