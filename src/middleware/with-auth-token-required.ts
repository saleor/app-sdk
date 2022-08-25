import { Middleware } from "retes";
import { Response } from "retes/response";

export const withAuthTokenRequired: Middleware = (handler) => async (request) => {
  const authToken = request.params.auth_token;
  if (!authToken) {
    return Response.BadRequest({
      success: false,
      message: "Missing auth token.",
    });
  }

  return handler(request);
};
