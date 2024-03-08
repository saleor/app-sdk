import { createDebug } from "../debug";

export const createFetchMiddlewareDebug = (middleware: string) =>
  createDebug(`FetchMiddleware:${middleware}`);
