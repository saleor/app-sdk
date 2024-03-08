import { SaleorApp } from "../saleor-app";
import { createFetchMiddlewareDebug } from "./middleware-debug";
import { FetchMiddleware, SaleorRequest } from "./types";

const debug = createFetchMiddlewareDebug("withSaleorApp");

export const withSaleorApp =
  (saleorApp: SaleorApp): FetchMiddleware =>
  (handler) =>
  async (request: SaleorRequest) => {
    debug("Middleware called");

    request.context ??= {};
    request.context.saleorApp = saleorApp;

    return handler(request);
  };

export const getSaleorAppFromRequest = (request: SaleorRequest): SaleorApp | undefined =>
  request.context?.saleorApp;
