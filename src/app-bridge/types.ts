import { createApp } from ".";
import { AppBridgeState } from "./app-bridge-state";

export type App = ReturnType<typeof createApp>;
export { AppBridgeState };
