import { useCallback, useEffect } from "react";

import { actions } from "../actions";
import { useAppBridge } from "../app-bridge-provider";

export type RoutingUpdateMethod = "push" | "replace";

/**
 * Synchronizes app inner state (inside iframe) with dashboard routing, so app's route can be restored after refresh
 */
export const useRoutePropagator = () => {
  const { appBridge, appBridgeState } = useAppBridge();

  const updateRouting = useCallback(
    (url: string | URL | null | undefined, method: RoutingUpdateMethod) => {
      if (!url || !appBridge) {
        return;
      }

      appBridge
        .dispatch(
          actions.UpdateRouting({
            newRoute: url.toString(),
            method,
          })
        )
        .catch(() => {
          console.error("Error dispatching action");
        });
    },
    []
  );

  useEffect(() => {
    if (!appBridgeState?.ready ?? !appBridge) {
      return;
    }

    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function pushState(data, unused, url) {
      const result = originalPushState.call(this, data, unused, url);
      // eslint-disable-next-line no-console
      console.log("pushState", { data, unused, url, result });
      updateRouting(url, "push");
      return result;
    };

    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = function replaceState(data, unused, url) {
      const result = originalReplaceState.call(this, data, unused, url);
      // eslint-disable-next-line no-console
      console.log("replaceState", { data, unused, url, result });
      updateRouting(url, "replace");
      return result;
    };

    const originalBack = window.history.back.bind(window.history);
    window.history.back = function back() {
      const result = originalBack.call(this);
      // eslint-disable-next-line no-console
      console.log("back", { result });
      // updateRouting(url, "replace");
      return result;
    };
    const originalForward = window.history.forward.bind(window.history);
    window.history.forward = function forward() {
      const result = originalForward.call(this);
      // eslint-disable-next-line no-console
      console.log("forward", { result });
      // updateRouting(url, "replace");
      return result;
    };

    // eslint-disable-next-line consistent-return
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.history.back = originalBack;
      window.history.forward = originalForward;
    };
  }, [appBridgeState, appBridge]);
};

/**
 * Synchronizes app inner state (inside iframe) with dashboard routing, so app's route can be restored after refresh
 *
 * Component uses useRoutePropagator(), but it can consume context in the same component where provider was used (e.g. _app.tsx)
 */
export function RoutePropagator() {
  useRoutePropagator();

  return null;
}
