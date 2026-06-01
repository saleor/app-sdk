import { type RefObject, useEffect } from "react";

import { useAppBridge } from "./app-bridge-provider";
import { SSR } from "./constants";
import { postWidgetHeight } from "./widget-resize";

/**
 * Size the Dashboard iframe to a widget root element — not `html`/`body`, which
 * stretch with the iframe height and produce incorrect measurements.
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
 *   const rootRef = useRef<HTMLDivElement>(null);
 *
 *   useWidgetAutoResize(rootRef);
 *
 *   return (
 *     <div ref={rootRef}>
 *       <MyWidgetContent />
 *     </div>
 *   );
 * }
 * ```
 */
export const useWidgetAutoResize = (
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
): void => {
  const { appBridgeState } = useAppBridge();
  const bridgeReady = Boolean(appBridgeState?.ready);

  useEffect(() => {
    if (SSR || !enabled) {
      return undefined;
    }

    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    let raf = 0;

    const schedulePost = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => postWidgetHeight(root));
    };

    schedulePost();

    const observer = new ResizeObserver(schedulePost);

    observer.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [enabled, bridgeReady, rootRef]);
};
