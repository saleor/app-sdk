import { Middleware } from "retes";
import { Response } from "retes/response";

import { APL } from "../APL";
import { getSaleorHeaders } from "../headers";

export const withRegisteredSaleorDomainHeader =
  ({ apl }: { apl: APL }): Middleware =>
  (handler) =>
  async (request) => {
    const { domain: saleorDomain } = getSaleorHeaders(request.headers);
    if (!saleorDomain) {
      return Response.BadRequest({
        success: false,
        message: "Domain header missing.",
      });
    }
    const authData = await apl.get(saleorDomain);
    if (!authData) {
      return Response.Forbidden({
        success: false,
        message: `Domain ${saleorDomain} not registered.`,
      });
    }

    return handler(request);
  };
