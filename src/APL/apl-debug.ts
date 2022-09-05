import { createDebug } from "../debug";

export const createAPLDebug = (namespace: string) => createDebug(`APL:${namespace}`);
