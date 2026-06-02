import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppBridge } from "./app-bridge";
import { reportWidgetHeight, reportWidgetHeightFromElement } from "./widget-resize";

describe("widget-resize", () => {
  let dispatchSpy: ReturnType<typeof vi.fn>;
  let appBridge: AppBridge;

  beforeEach(() => {
    dispatchSpy = vi.fn().mockResolvedValue(undefined);
    appBridge = { dispatch: dispatchSpy } as unknown as AppBridge;
  });

  describe("reportWidgetHeight", () => {
    it("warns when dispatch rejects", async () => {
      // Arrange
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const error = new Error("timeout");
      dispatchSpy.mockRejectedValue(error);

      // Act
      reportWidgetHeight(appBridge, 320);

      // Assert
      await vi.waitFor(() => {
        expect(warnSpy).toHaveBeenCalledWith("WidgetResize dispatch failed:", error);
      });

      warnSpy.mockRestore();
    });

    it("dispatches a WidgetResize action with the height", () => {
      // Arrange
      const height = 320;

      // Act
      reportWidgetHeight(appBridge, height);

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "widgetResize",
          payload: expect.objectContaining({ height }),
        }),
      );
    });

    it("ignores non-finite heights", () => {
      // Act
      reportWidgetHeight(appBridge, Number.NaN);
      reportWidgetHeight(appBridge, Number.POSITIVE_INFINITY);

      // Assert
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it("ignores non-positive heights", () => {
      // Act
      reportWidgetHeight(appBridge, 0);
      reportWidgetHeight(appBridge, -10);

      // Assert
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe("reportWidgetHeightFromElement", () => {
    it("measures the root and dispatches a WidgetResize action", () => {
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
      reportWidgetHeightFromElement(appBridge, root);

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "widgetResize",
          payload: expect.objectContaining({ height: 180 }),
        }),
      );
    });

    it("uses the larger of layout box height and scroll height, rounded up", () => {
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
      reportWidgetHeightFromElement(appBridge, root);

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "widgetResize",
          payload: expect.objectContaining({ height: 241 }),
        }),
      );
    });
  });
});
