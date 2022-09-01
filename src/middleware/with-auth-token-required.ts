import { Middleware } from "retes";
import { Response } from "retes/response";

import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withAuthTokenRequired");

export const withAuthTokenRequired: Middleware = (handler) => async (request) => {
  debug("Middleware called");

  const authToken = request.params.auth_token;

  if (!authToken) {
    debug("Found missing authToken param");

    return Response.BadRequest({
      success: false,
      message: "Missing auth token.",
    });
  }

  return handler(request);
};
