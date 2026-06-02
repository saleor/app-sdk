import { actions } from "./actions";
import type { AppBridge } from "./app-bridge";
import { SSR } from "./constants";

/**
 * Widget content root for height measurement.
 *
 * Excludes `document.documentElement` (`HTMLHtmlElement`) and `document.body` (`HTMLBodyElement`) —
 * in an iframe those nodes stretch with the iframe and cause incorrect feedback loops.
 */
type WidgetResizeRootElement = Exclude<HTMLElement, HTMLBodyElement | HTMLHtmlElement>;

const isPositiveFiniteHeight = (height: number): boolean => Number.isFinite(height) && height > 0;

/**
 * Measure widget root content height (layout box vs scroll overflow, rounded up).
 * Returns `null` when the DOM is unavailable (SSR) — not `0`, which is a valid element height.
 */
const measureWidgetHeight = (root: WidgetResizeRootElement): number | null => {
  if (SSR) {
    return null;
  }

  const layoutHeight = root.getBoundingClientRect().height;

  // scrollHeight catches overflowing children without using the document viewport.
  return Math.ceil(Math.max(layoutHeight, root.scrollHeight));
};

/**
 * Report a known widget height (in pixels) to the Saleor Dashboard.
 *
 * Escape hatch when you already have a height value. Dispatches the `WidgetResize`
 * App Bridge action. No-op during SSR. Invalid heights (non-finite or non-positive) are ignored.
 */
export const reportWidgetHeight = (appBridge: AppBridge, height: number): void => {
  if (SSR || !isPositiveFiniteHeight(height)) {
    return;
  }

  // Sizing is best-effort: a Dashboard without a widgetResize handler sends no response and dispatch
  // rejects after timeout. Warn for debugging but do not throw — reports are frequent.
  appBridge.dispatch(actions.WidgetResize({ height })).catch((error: unknown) => {
    console.warn("WidgetResize dispatch failed:", error);
  });
};

/**
 * Measure a widget root element and report its height to the Dashboard.
 *
 * Escape hatch when you are not using {@link useWidgetAutoResize}. Pass an element that wraps
 * your widget UI (for example a `div` ref), not `document.body` or `document.documentElement`.
 * No-op during SSR or when height cannot be measured.
 */
export const reportWidgetHeightFromElement = (
  appBridge: AppBridge,
  root: WidgetResizeRootElement,
): void => {
  const height = measureWidgetHeight(root);

  if (height === null) {
    return;
  }

  reportWidgetHeight(appBridge, height);
};
