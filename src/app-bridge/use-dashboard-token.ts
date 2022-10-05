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

  if (tokenClaims && !tokenClaims.iss) {
    console.error(`
    "iss" not found in decoded token claims. Ensure Saleor has domain assigned
    Check documentation for more details
    https://docs.saleor.io/docs/3.x/dashboard/configuration/site#general-information`);
  }

  const isTokenValid = tokenClaims ? tokenClaims.iss === appBridgeState?.domain : false;

  return {
    isTokenValid,
    tokenClaims,
    hasAppToken: Boolean(appBridgeState?.token),
  };
};
