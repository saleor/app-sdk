import { APL } from "../../APL";
import { createDebug } from "../../debug";
import { Permission } from "../../types";
import { ProtectedHandlerErrorCodeMap } from "../shared/protected-handler";
import { processSaleorProtectedHandler, ProtectedHandlerError } from "./process-protected-handler";

const debug = createDebug("WebAPI:ProtectedHandler");

type WebApiHandlerFn = (request: Request) => Response | Promise<Response>;

export const createProtectedHandler =
  (handlerFn: WebApiHandlerFn, apl: APL, requiredPermissions?: Permission[]): WebApiHandlerFn =>
  (request) => {
    debug("Protected handler called");
    return (
      processSaleorProtectedHandler({ request, apl, requiredPermissions })
        // TODO: Pass context
        .then(async () => {
          debug("Incoming request validated. Call handlerFn");
          return handlerFn(request);
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
        })
    );
  };
