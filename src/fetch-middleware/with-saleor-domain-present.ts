import { getSaleorHeadersFetchAPI } from "../headers";
import { createFetchMiddlewareDebug } from "./middleware-debug";
import { FetchMiddleware } from "./types";

const debug = createFetchMiddlewareDebug("withSaleorDomainPresent");

export const withSaleorDomainPresent: FetchMiddleware = (handler) => async (request) => {
  const { domain } = getSaleorHeadersFetchAPI(request.headers);

  debug("Middleware called with domain in header: %s", domain);

  if (!domain) {
    debug("Domain not found in header, will respond with Bad Request");

    return Response.json(
      {
        success: false,
        message: "Missing Saleor domain header.",
      },
      { status: 400 }
    );
  }

  return handler(request);
};
