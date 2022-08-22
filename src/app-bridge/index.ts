import { AppBridge } from "./app-bridge";

export { AppBridge };

export * from "./actions";
export * from "./events";
export * from "./types";

/**
 * @deprecated use new AppBridge()
 */
export const createApp = (targetDomain?: string) => new AppBridge(targetDomain);
export default createApp;
