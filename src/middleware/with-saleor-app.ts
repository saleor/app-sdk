import { Middleware, Request } from "retes";

import { SaleorApp } from "../saleor-app";
import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withSaleorApp");

export const withSaleorApp =
  (saleorApp: SaleorApp): Middleware =>
  (handler) =>
  async (request) => {
    debug("Middleware called");

    request.context ??= {};
    request.context.saleorApp = saleorApp;

    return handler(request);
  };

export const getSaleorAppFromRequest = (request: Request): SaleorApp | undefined =>
  request.context?.saleorApp;
