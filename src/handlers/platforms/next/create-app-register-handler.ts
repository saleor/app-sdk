import {
  RegisterActionHandler,
  RegisterHandlerResponseBody,
} from "@/handlers/actions/register-action-handler";
import { GenericCreateAppRegisterHandlerOptions } from "@/handlers/shared/create-app-register-handler-types";

import { NextJsAdapter, NextJsHandler, NextJsHandlerInput } from "./platform-adapter";

// Re-export types for backwards compatibility

export type { RegisterHandlerResponseBody };

export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"]
): RegisterHandlerResponseBody => ({
  success,
  error,
});

export type CreateAppRegisterHandlerOptions =
  GenericCreateAppRegisterHandlerOptions<NextJsHandlerInput>;

/**
 * Returns API route handler for **Next.js pages router**
 * for register endpoint that is called by Saleor when installing the app
 *
 * It verifies the request and stores `app_token` from Saleor
 * in APL and along with all required AuthData fields (jwks, saleorApiUrl, ...)
 *
 * **Recommended path**: `/api/register`
 * (configured in manifest handler)
 *
 * To learn more check Saleor docs
 * @see {@link https://docs.saleor.io/developer/extending/apps/architecture/app-requirements#register-url}
 * */
export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions): NextJsHandler =>
  async (req, res) => {
    const adapter = new NextJsAdapter(req, res);
    const actionHandler = new RegisterActionHandler(adapter);
    const result = await actionHandler.handleAction(config);
    return adapter.send(result);
  };
