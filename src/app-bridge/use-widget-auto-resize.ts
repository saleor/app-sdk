import { useEffect } from "react";

import { SSR } from "./constants";
import { measureWidgetHeight, reportWidgetHeight } from "./widget-resize";

export interface UseWidgetAutoResizeOptions {
  /**
   * Root element whose size drives the iframe height. Defaults to
   * `document.body`.
   */
  target?: HTMLElement | null;
}

/**
 * Automatically report widget content height to the Saleor Dashboard.
 *
 * Use on routes mounted as `*_DETAILS_WIDGETS` extensions so the iframe grows
 * and shrinks with your content instead of staying in a fixed box.
 *
 * Opt-in and backward compatible: existing apps that omit this hook keep the
 * Dashboard's default widget height until they adopt it.
 *
 * @example
 * ```tsx
 * export default function ProductDetailsWidgetPage() {
 *   useWidgetAutoResize();
 *   return <MyWidgetContent />;
 * }
 * ```
 */
export const useWidgetAutoResize = ({ target }: UseWidgetAutoResizeOptions = {}): void => {
  useEffect(() => {
    if (SSR) {
      return undefined;
    }

    const getRoot = () => target ?? document.body;

    const report = () => {
      reportWidgetHeight(measureWidgetHeight(getRoot()));
    };

    report();

    const resizeObserver = new ResizeObserver(report);

    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(getRoot());

    return () => {
      resizeObserver.disconnect();
    };
  }, [target]);
};
