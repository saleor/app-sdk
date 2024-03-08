import { createFetchMiddlewareDebug } from "./middleware-debug";
import { FetchMiddleware } from "./types";

const debug = createFetchMiddlewareDebug("withAuthTokenRequired");

export const withAuthTokenRequired: FetchMiddleware = (handler) => async (request) => {
  debug("Middleware called");

  try {
    // If we read `request.json()` without cloning it will throw an error
    // next time we run request.json()
    const clone = request.clone();
    const json = await clone.json();
    const authToken = json.auth_token;

    if (!authToken) {
      debug("Found missing authToken param");

      return Response.json(
        {
          success: false,
          message: "Missing auth token.",
        },
        { status: 400 }
      );
    }
  } catch {
    return Response.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  return handler(request);
};
