import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { measureWidgetHeight, reportWidgetHeight, WIDGET_RESIZE_MESSAGE } from "./widget-resize";

describe("widget-resize", () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;
  let parentWindow: Window;

  beforeEach(() => {
    postMessageSpy = vi.fn();
    parentWindow = { postMessage: postMessageSpy } as unknown as Window;

    Object.defineProperty(window, "parent", {
      configurable: true,
      value: parentWindow,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "parent", {
      configurable: true,
      value: window,
    });
  });

  describe("reportWidgetHeight", () => {
    it("posts the resize message to the parent window", () => {
      // Arrange
      const height = 320;

      // Act
      reportWidgetHeight(height);

      // Assert
      expect(postMessageSpy).toHaveBeenCalledWith({ type: WIDGET_RESIZE_MESSAGE, height }, "*");
    });

    it("ignores non-finite heights", () => {
      // Act
      reportWidgetHeight(Number.NaN);
      reportWidgetHeight(Number.POSITIVE_INFINITY);

      // Assert
      expect(postMessageSpy).not.toHaveBeenCalled();
    });

    it("ignores non-positive heights", () => {
      // Act
      reportWidgetHeight(0);
      reportWidgetHeight(-10);

      // Assert
      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });

  describe("measureWidgetHeight", () => {
    it("returns the largest scroll height among root candidates", () => {
      // Arrange
      const root = document.createElement("div");
      Object.defineProperty(document.documentElement, "scrollHeight", {
        configurable: true,
        value: 100,
      });
      Object.defineProperty(document.body, "scrollHeight", {
        configurable: true,
        value: 150,
      });
      Object.defineProperty(root, "scrollHeight", {
        configurable: true,
        value: 240,
      });

      // Act
      const height = measureWidgetHeight(root);

      // Assert
      expect(height).toBe(240);
    });
  });
});
