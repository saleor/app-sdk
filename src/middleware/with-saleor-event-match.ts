import { Middleware } from "retes";
import { Response } from "retes/response";

import { getSaleorHeaders } from "../headers";
import { createMiddlewareDebug } from "./middleware-debug";

const debug = createMiddlewareDebug("withSaleorEventMatch");

export const withSaleorEventMatch =
  <E extends string>(expectedEvent: `${Lowercase<E>}`): Middleware =>
  (handler) =>
  async (request) => {
    const { event } = getSaleorHeaders(request.headers);

    debug("Middleware called with even header: \"%s\"", event);

    if (event !== expectedEvent) {
      debug(
        "Event from header (%s) doesnt match expected (%s). Will respond with Bad Request",
        event,
        expectedEvent
      );

      return Response.BadRequest({
        success: false,
        message: `Invalid Saleor event. Expecting ${expectedEvent}.`,
      });
    }

    return handler(request);
  };
