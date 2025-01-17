import { APL } from "@/APL";
import { createDebug } from "@/debug";
import { ProtectedHandlerErrorCodeMap } from "@/handlers/shared/protected-handler";
import { ProtectedHandlerContext } from "@/handlers/shared/protected-handler-context";
import { Permission } from "@/types";

import { processSaleorProtectedHandler, ProtectedHandlerError } from "./process-protected-handler";

const debug = createDebug("WebAPI:ProtectedHandler");

export type WebApiProtectedHandler = (
  request: Request,
  ctx: ProtectedHandlerContext
) => Response | Promise<Response>;

export const createProtectedHandler =
  (
    handlerFn: WebApiProtectedHandler,
    apl: APL,
    requiredPermissions?: Permission[]
  ): WebApiProtectedHandler =>
  (request) => {
    debug("Protected handler called");
    return processSaleorProtectedHandler({ request, apl, requiredPermissions })
      .then(async (ctx) => {
        debug("Incoming request validated. Call handlerFn");
        return handlerFn(request, ctx);
      })
      .catch((e) => {
        debug("Unexpected error during processing the request");

        if (e instanceof ProtectedHandlerError) {
          debug(`Validation error: ${e.message}`);
          return new Response("Invalid request", {
            status: ProtectedHandlerErrorCodeMap[e.errorType] || 400,
          });
        }
        debug("Unexpected error: %O", e);
        return new Response("Unexpected error while handling request", { status: 500 });
      });
  };
