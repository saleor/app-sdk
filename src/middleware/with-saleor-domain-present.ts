import { Middleware } from "retes";
import { Response } from "retes/response";

import { getSaleorHeaders } from "../headers";

export const withSaleorDomainPresent: Middleware = (handler) => async (request) => {
  const { domain } = getSaleorHeaders(request.headers);

  if (!domain) {
    return Response.BadRequest({
      success: false,
      message: "Missing Saleor domain header.",
    });
  }

  return handler(request);
};
