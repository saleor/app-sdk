import { getSaleorHeadersFetchAPI } from "../headers";
import { createFetchMiddlewareDebug } from "./middleware-debug";
import { FetchMiddleware } from "./types";
import { getSaleorAppFromRequest } from "./with-saleor-app";

const debug = createFetchMiddlewareDebug("withRegisteredSaleorDomainHeader");

export const withRegisteredSaleorDomainHeader: FetchMiddleware = (handler) => async (request) => {
  const { saleorApiUrl } = getSaleorHeadersFetchAPI(request.headers);

  if (!saleorApiUrl) {
    return Response.json(
      { success: false, message: "saleorApiUrl header missing" },
      { status: 400 }
    );
  }

  debug("Middleware called with saleorApiUrl: \"%s\"", saleorApiUrl);

  const saleorApp = getSaleorAppFromRequest(request);

  if (!saleorApp) {
    console.error(
      "SaleorApp not found in request context. Ensure your API handler is wrapped with withSaleorApp middleware"
    );

    return Response.json(
      {
        success: false,
        message: "SaleorApp is misconfigured",
      },
      { status: 500 }
    );
  }

  const authData = await saleorApp?.apl.get(saleorApiUrl);

  if (!authData) {
    debug("Auth was not found in APL, will respond with Forbidden status");

    return Response.json(
      {
        success: false,
        message: `Saleor: ${saleorApiUrl} not registered.`,
      },
      { status: 403 }
    );
  }

  return handler(request);
};
