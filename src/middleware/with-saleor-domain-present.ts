import { Middleware } from "retes";
import { Response } from "retes/response";

import { getSaleorHeaders } from "../headers";
import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withSaleorDomainPresent");

export const withSaleorDomainPresent: Middleware = (handler) => async (request) => {
  const { domain } = getSaleorHeaders(request.headers);

  debug("Middleware called with domain in header: %s", domain);

  if (!domain) {
    debug("Domain not found in header, will respond with Bad Request");

    return Response.BadRequest({
      success: false,
      message: "Missing Saleor domain header.",
    });
  }

  return handler(request);
};
