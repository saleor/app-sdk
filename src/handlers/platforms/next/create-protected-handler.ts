import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { APL } from "@/APL";
import {
  ProtectedActionValidator,
  ProtectedHandlerContext,
} from "@/handlers/shared/protected-action-validator";
import { Permission } from "@/types";

import { NextJsAdapter } from "./platform-adapter";

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
  async (req, res) => {
    const adapter = new NextJsAdapter(req, res);
    const actionValidator = new ProtectedActionValidator(adapter);
    const validationResult = await actionValidator.validateRequest({
      apl,
      requiredPermissions,
    });

    if (validationResult.result === "failure") {
      return adapter.send(validationResult.value);
    }

    const context = validationResult.value;
    try {
      return handlerFn(req, res, context);
    } catch (err) {
      return res.status(500).end();
    }
  };
