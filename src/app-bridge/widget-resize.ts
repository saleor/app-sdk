import { SSR } from "./constants";

/**
 * Message type the Dashboard listens for to resize detail-page sidebar widget
 * iframes. Keep in sync with Saleor Dashboard's useWidgetIframeAutoHeight.
 *
 * @see https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/app-bridge
 */
export const WIDGET_RESIZE_MESSAGE = "saleor:widget:resize";

export interface WidgetResizeMessage {
  type: typeof WIDGET_RESIZE_MESSAGE;
  height: number;
}

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
 * Safe to call from non-browser contexts — it becomes a no-op during SSR.
 * Invalid heights (non-finite or non-positive) are ignored.
 */
export const reportWidgetHeight = (height: number): void => {
  if (SSR || !window.parent || window.parent === window) {
    return;
  }

  if (!isPositiveFiniteHeight(height)) {
    return;
  }

  const message: WidgetResizeMessage = {
    type: WIDGET_RESIZE_MESSAGE,
    height,
  };

  window.parent.postMessage(message, "*");
};

/**
 * Measure a widget root and report its height to the Dashboard.
 *
 * No-op when not embedded in an iframe or when the root is missing.
 */
export const postWidgetHeight = (root?: HTMLElement | null): void => {
  if (SSR || !window.parent || window.parent === window || !root) {
    return;
  }

  const height = measureWidgetHeight(root);

  if (!isPositiveFiniteHeight(height)) {
    return;
  }

  reportWidgetHeight(height);
};
