import debugPkg from "debug";
import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AppBridge } from "./app-bridge";
import { AppBridgeState } from "./app-bridge-state";

const debug = debugPkg.debug("app-sdk:AppBridgeProvider");

interface AppBridgeContext {
  /**
   * App can be undefined, because it gets initialized in Browser only
   */
  appBridge?: AppBridge;
  mounted: boolean;
}

type Props = {
  appBridgeInstance?: AppBridge;
};

export const AppContext = React.createContext<AppBridgeContext>({
  appBridge: undefined,
  mounted: false,
});

export function AppBridgeProvider({ appBridgeInstance, ...props }: React.PropsWithChildren<Props>) {
  debug("Provider mounted");
  const [appBridge, setAppBridge] = useState<AppBridge | undefined>(appBridgeInstance);

  useEffect(() => {
    if (appBridge) {
      debug("AppBridge provided in props, will use this one");

      return undefined;
    }

    debug("AppBridge not defined, will create new instance");

    const instance = new AppBridge();

    setAppBridge(instance);

    /**
     * Only instances created here are destroyed here — an instance passed via
     * props is owned by the caller. Without this, StrictMode's double-mount
     * leaves two live bridges attached to the same window, so every Dashboard
     * shortcut and event gets handled twice.
     */
    return () => {
      debug("Provider unmounted, will destroy the AppBridge it created");

      instance.destroy();
    };
  }, []);

  const contextValue = useMemo(
    (): AppBridgeContext => ({
      appBridge,
      mounted: true,
    }),
    [appBridge],
  );

  return <AppContext.Provider value={contextValue} {...props} />;
}

export const useAppBridge = () => {
  const { appBridge, mounted } = useContext(AppContext);
  const [appBridgeState, setAppBridgeState] = useState<AppBridgeState | null>(() =>
    appBridge ? appBridge.getState() : null,
  );

  if (typeof window !== "undefined" && !mounted) {
    throw new Error("useAppBridge used outside of AppBridgeProvider");
  }

  const updateState = useCallback(() => {
    if (appBridge?.getState()) {
      debug("Detected state change in AppBridge, will set new state");
      setAppBridgeState(appBridge.getState());
    }
  }, [appBridge]);

  useEffect(() => {
    let unsubscribes: Array<Function> = [];

    if (appBridge) {
      debug("Provider mounted, will set up listeners");

      unsubscribes = [
        appBridge.subscribe("handshake", updateState),
        appBridge.subscribe("theme", updateState),
        appBridge.subscribe("response", updateState),
        appBridge.subscribe("redirect", updateState),
        appBridge.subscribe("formPayload", updateState),
        appBridge.subscribe("shortcutsChanged", updateState),
      ];
    }

    return () => {
      debug("Provider unmounted, will clean up listeners");
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [appBridge, updateState]);

  return { appBridge, appBridgeState };
};
