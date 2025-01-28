import { FetchMiddleware } from "./types";

export const HTTPMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  DELETE: "DELETE",
} as const;
export type HTTPMethod = typeof HTTPMethod[keyof typeof HTTPMethod];

export const withMethod =
  (...methods: HTTPMethod[]): FetchMiddleware =>
  (handler) =>
  async (request) => {
    if (!methods.includes(request.method as HTTPMethod)) {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: methods.join(", ") },
      });
    }

    const response = await handler(request);

    return response;
  };
