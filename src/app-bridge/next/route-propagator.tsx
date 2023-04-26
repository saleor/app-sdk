/**
 * Use .js extension to avoid broken builds with ESM
 */
import * as NextRouter from "next/router.js";
import { useEffect } from "react";

import { actions } from "../actions";
import { useAppBridge } from "../app-bridge-provider";

const { useRouter } = NextRouter;

/**
 * Synchronizes app inner state (inside iframe) with dashboard routing, so app's route can be restored after refresh
 */
export const useRoutePropagator = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const router = useRouter();

  useEffect(() => {
    if (!appBridgeState?.ready ?? !appBridge) {
      return;
    }

    router.events.on("routeChangeComplete", (url) => {
      appBridge
        ?.dispatch(
          actions.UpdateRouting({
            newRoute: url,
          })
        )
        .catch(() => {
          console.error("Error dispatching action");
        });
    });
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
