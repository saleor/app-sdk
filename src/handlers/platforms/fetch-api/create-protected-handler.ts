import { APL } from "@/APL";
import {
  ProtectedActionValidator,
  ProtectedHandlerContext,
} from "@/handlers/shared/protected-action-validator";
import { Permission } from "@/types";

import { WebApiAdapter } from "./platform-adapter";

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
  async (request) => {
    const adapter = new WebApiAdapter(request);
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
      return await handlerFn(request, context);
    } catch (err) {
      return new Response("Unexpected server error", { status: 500 });
    }
  };
