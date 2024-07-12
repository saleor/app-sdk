
import { APL } from "../../APL";
import { createDebug } from "../../debug";
import { Permission } from "../../types";
import { ProtectedHandlerContext } from "../protected-handler-context";
import {
  processSaleorProtectedHandler,
  ProtectedHandlerError,
  SaleorProtectedHandlerError,
} from "../process-protected-handler";
import { NextRequest, NextResponse } from "next/server";

const debug = createDebug("ProtectedHandler");

export const ProtectedHandlerErrorCodeMap: Record<SaleorProtectedHandlerError, number> = {
  OTHER: 500,
  MISSING_HOST_HEADER: 400,
  MISSING_DOMAIN_HEADER: 400,
  MISSING_API_URL_HEADER: 400,
  NOT_REGISTERED: 401,
  JWT_VERIFICATION_FAILED: 401,
  NO_APP_ID: 401,
  MISSING_AUTHORIZATION_BEARER_HEADER: 400,
};

export type NextAppRouterProtectedApiHandler = (
  req: NextRequest,
  ctx: ProtectedHandlerContext
) => Promise<Response>;

/**
 * Wraps provided function, to ensure incoming request comes from Saleor Dashboard.
 * Also provides additional `context` object containing request properties.
 */
export const createProtectedHandler =
  (handlerFn: NextAppRouterProtectedApiHandler, apl: APL, requiredPermissions?: Permission[]) =>
  (req: NextRequest) => {
    debug("Protected handler called");
    processSaleorProtectedHandler({
      req,
      apl,
      requiredPermissions,
    })
      .then(async (context) => {
        debug("Incoming request validated. Call handlerFn");
        return handlerFn(req, context);
      })
      .catch((e) => {
        debug("Unexpected error during processing the request");

        if (e instanceof ProtectedHandlerError) {
          debug(`Validation error: ${e.message}`);
          return NextResponse.json(
            {
              message: "Validation error",
            },
            { status: ProtectedHandlerErrorCodeMap[e.errorType] || 400 }
          );
        }
        debug("Unexpected error: %O", e);
        debug(`Validation error: ${e.message}`);

        return NextResponse.json(
          {
            message: "Unexpected error",
          },
          { status: 500 }
        );
      });
  };
