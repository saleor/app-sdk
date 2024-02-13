import { useCallback, useEffect } from "react";

import { actions } from "../actions";
import { useAppBridge } from "../app-bridge-provider";

/**
 * Synchronizes app inner state (inside iframe) with dashboard routing, so app's route can be restored after refresh
 */
export const useRoutePropagator = () => {
  const { appBridge, appBridgeState } = useAppBridge();

  const updateRouting = useCallback((url: string | URL | null | undefined, replace: boolean) => {
    if (!url || !appBridge) {
      return;
    }

    appBridge
      .dispatch(
        actions.UpdateRouting({
          newRoute: url.toString(),
          replace,
        })
      )
      .catch(() => {
        console.error("Error dispatching action");
      });
  }, []);

  useEffect(() => {
    if (!appBridgeState?.ready ?? !appBridge) {
      return;
    }

    useEffect(() => {
      const originalPushState = window.history.pushState.bind(window.history);
      window.history.pushState = function pushState(data, unused, url) {
        const result = originalPushState.call(this, data, unused, url);
        updateRouting(url, false);
        return result;
      };
      const originalReplaceState = window.history.replaceState.bind(window.history);
      window.history.replaceState = function replaceState(data, unused, url) {
        const result = originalReplaceState.call(this, data, unused, url);
        updateRouting(url, true);
        return result;
      };

      return () => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }, [updateRouting]);
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
