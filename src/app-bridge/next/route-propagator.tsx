/**
 * Use .js extension to avoid broken builds with ESM
 */
import * as NextRouter from "next/navigation.js";
import { useEffect } from "react";

import { actions } from "../actions";
import { useAppBridge } from "../app-bridge-provider";

const { usePathname, useSearchParams } = NextRouter;

/**
 * Synchronizes app inner state (inside iframe) with dashboard routing, so app's route can be restored after refresh
 */
export const useRoutePropagator = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!appBridgeState?.ready ?? !appBridge) {
      return;
    }

    const url = `${pathname}?${searchParams}`;

    appBridge
      ?.dispatch(
        actions.UpdateRouting({
          newRoute: url,
        })
      )
      .catch(() => {
        console.error("Error dispatching action");
      });
  }, [appBridgeState, appBridge, pathname, searchParams]);
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
