import debugPkg from "debug";
import * as jose from "jose";
import { useMemo } from "react";

import { useAppBridge } from "./app-bridge-provider";

export interface DashboardTokenPayload extends jose.JWTPayload {
  app: string;
}

export interface DashboardTokenProps {
  isTokenValid: boolean;
  hasAppToken: boolean;
  tokenClaims: DashboardTokenPayload | null;
}

const debug = debugPkg.debug("app-sdk:AppBridge:useDashboardToken");

export const useDashboardToken = (): DashboardTokenProps => {
  const { appBridgeState } = useAppBridge();

  const tokenClaims = useMemo(() => {
    try {
      if (appBridgeState?.token) {
        debug("Trying to decode JWT token from dashboard");
        return jose.decodeJwt(appBridgeState?.token) as DashboardTokenPayload;
      }
    } catch (e) {
      debug("Failed decoding JWT token");
      console.error(e);
    }
    return null;
  }, [appBridgeState?.token]);

  return {
    /**
     * TODO: Add tokenClaims.iss validation, when added to Saleor
     * @see: https://github.com/saleor/saleor/pull/10852
     */
    isTokenValid: !!tokenClaims,
    tokenClaims,
    hasAppToken: Boolean(appBridgeState?.token),
  };
};
