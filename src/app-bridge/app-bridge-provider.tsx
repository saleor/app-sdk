import * as React from "react";
import { useContext, useEffect, useMemo, useState } from "react";

import { AppBridge } from "./app-bridge";

interface AppBridgeContext {
  /**
   * App can be undefined, because it gets initialized in Browser only
   */
  app?: AppBridge;
  mounted: boolean;
}

type Props = {
  appBridgeInstance?: AppBridge;
};

export const AppContext = React.createContext<AppBridgeContext>({ app: undefined, mounted: false });

/**
 * Experimental - try to use provider in app-sdk itself
 * Consider monorepo with dedicated react package
 */
export function AppBridgeProvider({ appBridgeInstance, ...props }: React.PropsWithChildren<Props>) {
  const [appBridge, setAppBridge] = useState<AppBridge | undefined>(appBridgeInstance);

  useEffect(() => {
    if (!appBridge) {
      setAppBridge(appBridgeInstance ?? new AppBridge());
    }
  }, []);

  const contextValue = useMemo(
    (): AppBridgeContext => ({
      app: appBridge,
      mounted: true,
    }),
    [appBridge]
  );

  return <AppContext.Provider value={contextValue} {...props} />;
}

export const useAppBridge = () => {
  const appContext = useContext(AppContext);

  if (typeof window !== "undefined" && !appContext.mounted) {
    throw new Error("useAppBridge used outside of AppBridgeProvider");
  }

  return appContext;
};

/**
 * Ensures component re-renders each time even from Dashboard receives
 */
export const useReactiveAppBridge = () => {
  const { app } = useAppBridge();
  const [, setState] = useState(0);

  const update = () => {
    setState(Math.random());
  };

  useEffect(() => {
    let unsubscribes: Array<Function> = [];

    if (app) {
      unsubscribes = [
        app.subscribe("handshake", update),
        app.subscribe("theme", update),
        app.subscribe("response", update),
        app.subscribe("redirect", update),
      ];
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [app]);

  return app;
};
