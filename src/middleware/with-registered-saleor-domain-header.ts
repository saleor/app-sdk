import { Middleware } from "retes";
import { Response } from "retes/response";

import { APL } from "../APL";
import { getSaleorHeaders } from "../headers";
import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withRegisteredSaleorDomainHeader");

export const withRegisteredSaleorDomainHeader =
  ({ apl }: { apl: APL }): Middleware =>
  (handler) =>
  async (request) => {
    const { domain: saleorDomain } = getSaleorHeaders(request.headers);

    if (!saleorDomain) {
      return Response.BadRequest({
        success: false,
        error: {
          message: "Domain header missing.",
        },
      });
    }

    debug("Middleware called with domain: \"%s\"", saleorDomain);

    const authData = await apl.get(saleorDomain);

    if (!authData) {
      debug("Auth was not found in APL, will respond with Forbidden status");

      return Response.Forbidden({
        success: false,
        error: {
          message: `Domain ${saleorDomain} not registered.`,
        },
      });
    }

    return handler(request);
  };
