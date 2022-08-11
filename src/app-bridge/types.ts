import { createApp } from ".";
import { AppBridgeState } from "./app";

export type App = ReturnType<typeof createApp>;
export { AppBridgeState };
