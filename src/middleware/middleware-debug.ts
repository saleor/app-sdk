import { Middleware } from "retes";

import { createDebug } from "../debug";

export const createMiddlewareDebug = (middleware: string) =>
  createDebug(`Middleware:${middleware}`);

type DebugFactory = (handlerName: string) => (msg: string, ...args: unknown[]) => void;

/**
 * Experimental. Needs to be tested and evaluated on security
 */
export const withReqResDebugging =
  (debugFactory: DebugFactory = createMiddlewareDebug): Middleware =>
  (handler) =>
  async (request) => {
    const debug = debugFactory(handler.name);

    debug("Called with request %j", request);

    const response = await handler(request);

    debug("Responded with response %j", response);

    return response;
  };
