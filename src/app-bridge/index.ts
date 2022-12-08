import { AppBridge } from "./app-bridge";

export { AppBridge };

export * from "./actions";
export * from "./app-bridge-provider";
export * from "./app-iframe-params";
export * from "./events";
export * from "./fetch";
export * from "./types";
export * from "./use-dashboard-token";
export * from "./with-authorization";

/**
 * @deprecated use new AppBridge(), createApp will be removed
 */
export const createApp = (targetDomain?: string) =>
  new AppBridge(targetDomain ? { targetDomain } : undefined);
export default createApp;
