import { Middleware } from "retes";
import { Response } from "retes/response";

import { getSaleorHeaders } from "../headers";

export const withSaleorEventMatch =
  <E extends string>(expectedEvent: `${Lowercase<E>}`): Middleware =>
  (handler) =>
  async (request) => {
    const { event } = getSaleorHeaders(request.headers);

    if (event !== expectedEvent) {
      return Response.BadRequest({
        success: false,
        message: `Invalid Saleor event. Expecting ${expectedEvent}.`,
      });
    }

    return handler(request);
  };
