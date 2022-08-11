import { AppBridge } from "./app-bridge";

export * from "./actions";
export * from "./events";
export * from "./types";

/**
 * @deprecated avoid default functions in SDKs
 * TODO: Expose AppBridge()
 */
export const createApp = (targetDomain?: string) => new AppBridge(targetDomain);
export default createApp;
