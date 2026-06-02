import { actions } from "./actions";
import type { AppBridge } from "./app-bridge";
import { SSR } from "./constants";

const isPositiveFiniteHeight = (height: number): boolean => Number.isFinite(height) && height > 0;

/**
 * Measure a widget root element's content height.
 *
 * Prefer this over `document.body` / `document.documentElement` — in an iframe
 * those nodes stretch with the iframe, which causes incorrect feedback loops.
 */
export const measureWidgetHeight = (root: HTMLElement): number => {
  if (SSR) {
    return 0;
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

  // Sizing is best-effort and high-frequency: a Dashboard with no widgetResize action handler sends
  // no response, so each report rejects after dispatch's 10s timeout. Swallow silently rather than
  // logging, since these failures are expected and reports are frequent.
  appBridge.dispatch(actions.WidgetResize({ height })).catch(() => {});
};

/**
 * Measure a widget root and report its height to the Dashboard.
 *
 * No-op during SSR or when the root is missing.
 */
export const postWidgetHeight = (appBridge: AppBridge, root?: HTMLElement | null): void => {
  if (SSR || !root) {
    return;
  }

  reportWidgetHeight(appBridge, measureWidgetHeight(root));
};
