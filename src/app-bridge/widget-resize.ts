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
 * Measure the content height of a widget page.
 *
 * @param root Element whose scroll height should be included. Defaults to
 * `document.body`.
 */
export const measureWidgetHeight = (root?: HTMLElement | null): number => {
  if (SSR) {
    return 0;
  }

  const element = root ?? document.body;

  return Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    element.scrollHeight,
  );
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
