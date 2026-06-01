import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  measureWidgetHeight,
  postWidgetHeight,
  reportWidgetHeight,
  WIDGET_RESIZE_MESSAGE,
} from "./widget-resize";

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
    it("returns the larger of layout box height and scroll height, rounded up", () => {
      // Arrange
      const root = document.createElement("div");
      root.getBoundingClientRect = () =>
        ({
          height: 120,
        }) as DOMRect;
      Object.defineProperty(root, "scrollHeight", {
        configurable: true,
        value: 240.2,
      });

      // Act
      const height = measureWidgetHeight(root);

      // Assert
      expect(height).toBe(241);
    });
  });

  describe("postWidgetHeight", () => {
    it("measures the root and posts the resize message", () => {
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

      // Act
      postWidgetHeight(root);

      // Assert
      expect(postMessageSpy).toHaveBeenCalledWith(
        { type: WIDGET_RESIZE_MESSAGE, height: 180 },
        "*",
      );
    });

    it("does nothing when root is missing", () => {
      // Act
      postWidgetHeight(null);

      // Assert
      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });
});
