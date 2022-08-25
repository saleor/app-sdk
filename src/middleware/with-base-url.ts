import { Middleware } from "retes";

export const withBaseURL: Middleware = (handler) => async (request) => {
  const { host, "x-forwarded-proto": protocol = "http" } = request.headers;

  request.context.baseURL = `${protocol}://${host}`;

  return handler(request);
};
