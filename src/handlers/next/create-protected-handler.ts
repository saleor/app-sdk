import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { APL } from "../../APL";
import { createDebug } from "../../debug";
import { ProtectedHandlerContext } from "./process-async-saleor-webhook";
import {
  processSaleorProtectedHandler,
  ProtectedHandlerError,
  SaleorProtectedHandlerError,
} from "./process-protected-handler";

const debug = createDebug("ProtectedHandler");

export const ProtectedHandlerErrorCodeMap: Record<SaleorProtectedHandlerError, number> = {
  OTHER: 500,
  MISSING_HOST_HEADER: 400,
  MISSING_DOMAIN_HEADER: 400,
  NOT_REGISTERED: 401,
  JWT_VERIFICATION_FAILED: 401,
  NO_APP_ID: 401,
  MISSING_AUTHORIZATION_BEARER_HEADER: 400,
};

export type NextProtectedApiHandler<TResp = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<TResp>,
  ctx: ProtectedHandlerContext
) => unknown | Promise<unknown>;

/**
 * Wraps provided function, to ensure incoming request comes from Saleor Dashboard.
 * Also provides additional `context` object containing request properties.
 *
 * @param handlerFn NextApiHandler function which takes additional `context` argument
 * @returns NextApiHandler
 */
export const createProtectedHandler =
  (handlerFn: NextProtectedApiHandler, apl: APL): NextApiHandler =>
  async (req, res) => {
    debug("Protected handler called");
    await processSaleorProtectedHandler({
      req,
      apl,
    })
      .then(async (context) => {
        debug("Incoming request validated. Call handlerFn");
        return handlerFn(req, res, context);
      })
      .catch((e) => {
        debug("Unexpected error during processing the request");

        if (e instanceof ProtectedHandlerError) {
          debug(`Validation error: ${e.message}`);
          res.status(ProtectedHandlerErrorCodeMap[e.errorType] || 400).end();
          return;
        }
        debug("Unexpected error: %O", e);
        res.status(500).end();
      });
  };
