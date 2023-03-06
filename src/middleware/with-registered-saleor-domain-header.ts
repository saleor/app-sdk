import { Middleware } from "retes";
import { Response } from "retes/response";

import { getSaleorHeaders } from "../headers";
import { createMiddlewareDebug } from "./middleware-debug";
import { getSaleorAppFromRequest } from "./with-saleor-app";

const debug = createMiddlewareDebug("withRegisteredSaleorDomainHeader");

export const withRegisteredSaleorDomainHeader: Middleware = (handler) => async (request) => {
  const { saleorApiUrl } = getSaleorHeaders(request.headers);

  if (!saleorApiUrl) {
    return Response.BadRequest({
      success: false,
      message: "saleorApiUrl header missing.",
    });
  }

  debug("Middleware called with saleorApiUrl: \"%s\"", saleorApiUrl);

  const saleorApp = getSaleorAppFromRequest(request);

  if (!saleorApp) {
    console.error(
      "SaleorApp not found in request context. Ensure your API handler is wrapped with withSaleorApp middleware"
    );

    return Response.InternalServerError({
      success: false,
      message: "SaleorApp is misconfigured",
    });
  }

  const authData = await saleorApp?.apl.get(saleorApiUrl);

  if (!authData) {
    debug("Auth was not found in APL, will respond with Forbidden status");

    return Response.Forbidden({
      success: false,
      message: `Saleor: ${saleorApiUrl} not registered.`,
    });
  }

  return handler(request);
};
