import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "../const";
import { AppBridge } from "./app-bridge";
import { useAppBridge } from "./app-bridge-provider";

type HasAppBridgeState = Pick<AppBridge, "getState">;

/**
 * Created decorated window.fetch with headers required by app-sdk Next api handlers utilities
 */
export const createAuthenticatedFetch =
  (appBridge: HasAppBridgeState, fetch = global.fetch): typeof global.fetch =>
  (input, init) => {
    const { token, domain } = appBridge.getState();

    const headers = new Headers(init?.headers);
    headers.set(SALEOR_DOMAIN_HEADER, domain);
    headers.set(SALEOR_AUTHORIZATION_BEARER_HEADER, token ?? "");

    const clonedInit: RequestInit = {
      ...(init ?? {}),
      headers,
    };

    return fetch(input, clonedInit);
  };

/**
 * Hook working only in browser context. Ensure parent component is dynamic() and mounted in the browser.
 */
export const useAuthenticatedFetch = (fetch = global.fetch) => {
  const { appBridge } = useAppBridge();

  if (!appBridge) {
    throw new Error("useAuthenticatedFetch can be used only in browser context");
  }

  return createAuthenticatedFetch(appBridge, fetch);
};
