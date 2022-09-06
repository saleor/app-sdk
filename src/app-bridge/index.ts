import { AppBridge } from "./app-bridge";

export { AppBridge };

export * from "./actions";
export * from "./app-bridge-provider";
export * from "./events";
export * from "./types";

/**
 * @deprecated use new AppBridge(), createApp will be removed
 */
export const createApp = (targetDomain?: string) =>
  new AppBridge(targetDomain ? { targetDomain } : undefined);
export default createApp;
