import { Middleware } from "retes";

import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withBaseURL");

export const withBaseURL: Middleware = (handler) => async (request) => {
  const { host, "x-forwarded-proto": protocol = "http" } = request.headers;

  debug("Middleware called with host: %s, protocol %s", host, request.headers["x-forwarded-proto"]);

  request.context.baseURL = `${protocol}://${host}`;

  debug("context.baseURL resolved to be: \"%s\"", request.context.baseURL);

  return handler(request);
};
