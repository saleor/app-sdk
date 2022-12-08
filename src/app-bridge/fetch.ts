import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "../const";
import { AppBridge } from "./app-bridge";
import { useAppBridge } from "./app-bridge-provider";

type HasAppBridgeState = Pick<AppBridge, "getState">;
export const createAuthenticatedFetch =
  (appBridge: HasAppBridgeState, fetch = window.fetch): typeof window.fetch =>
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

export const useAuthenticatedFetch = (fetch = window.fetch) => {
  const { appBridge } = useAppBridge();

  if (!appBridge) {
    throw new Error("useAuthenticatedFetch can be used only in browser context");
  }

  return createAuthenticatedFetch(appBridge, fetch);
};
