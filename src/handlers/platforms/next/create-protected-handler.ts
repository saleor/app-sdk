import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { APL } from "@/APL";
import { createDebug } from "@/debug";
import { ProtectedHandlerErrorCodeMap } from "@/handlers/shared/protected-handler";
import { ProtectedHandlerContext } from "@/handlers/shared/protected-handler-context";
import { Permission } from "@/types";

import { processSaleorProtectedHandler, ProtectedHandlerError } from "./process-protected-handler";

const debug = createDebug("ProtectedHandler");

export type NextProtectedApiHandler<TResp = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<TResp>,
  ctx: ProtectedHandlerContext
) => unknown | Promise<unknown>;

/**
 * Wraps provided function, to ensure incoming request comes from Saleor Dashboard.
 * Also provides additional `context` object containing request properties.
 */
export const createProtectedHandler =
  (
    handlerFn: NextProtectedApiHandler,
    apl: APL,
    requiredPermissions?: Permission[]
  ): NextApiHandler =>
  (req, res) => {
    debug("Protected handler called");
    processSaleorProtectedHandler({
      req,
      apl,
      requiredPermissions,
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
