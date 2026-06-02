import { actions } from "./actions";
import type { AppBridge } from "./app-bridge";
import { SSR } from "./constants";

/**
 * Widget content root for height measurement.
 *
 * Excludes `document.documentElement` (`HTMLHtmlElement`) and `document.body` (`HTMLBodyElement`) —
 * in an iframe those nodes stretch with the iframe and cause incorrect feedback loops.
 */
export type WidgetResizeRootElement = Exclude<HTMLElement, HTMLBodyElement | HTMLHtmlElement>;

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
 * Report the widget iframe height to the Saleor Dashboard.
 *
 * Dispatches the `WidgetResize` App Bridge action — the same channel used for
 * every other Dashboard command. No-op during SSR. Invalid heights (non-finite
 * or non-positive) are ignored.
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
 * Measure a widget root and report its height to the Dashboard.
 *
 * Pass a {@link WidgetResizeRootElement} that wraps your widget UI (for example a `div` ref).
 * No-op during SSR or when height cannot be measured.
 */
export const postWidgetHeight = (appBridge: AppBridge, root: WidgetResizeRootElement): void => {
  const height = measureWidgetHeight(root);

  if (height === null) {
    return;
  }

  reportWidgetHeight(appBridge, height);
};
