import {
  RegisterActionHandler,
  RegisterHandlerResponseBody,
} from "@/handlers/actions/register-action-handler";
import { GenericCreateAppRegisterHandlerOptions } from "@/handlers/shared/create-app-register-handler-types";

import { WebApiAdapter, WebApiHandler, WebApiHandlerInput } from "./platform-adapter";

export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"]
): RegisterHandlerResponseBody => ({
  success,
  error,
});

export type CreateAppRegisterHandlerOptions =
  GenericCreateAppRegisterHandlerOptions<WebApiHandlerInput>;

/**
 * Returns API route handler for Web API compatible request handlers
 * (examples: Next.js app router, hono, deno, etc.)
 * that use signature: (req: Request) => Response
 * where Request and Response are Fetch API objects
 *
 * Handler is for register endpoint that is called by Saleor when installing the app
 *
 * It verifies the request and stores `app_token` from Saleor
 * in APL and along with all required AuthData fields (jwks, saleorApiUrl, ...)
 *
 * **Recommended path**: `/api/register`
 * (configured in manifest handler)
 *
 * To learn more check Saleor docs
 * @see {@link https://docs.saleor.io/developer/extending/apps/architecture/app-requirements#register-url}
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request}
 * */
export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions): WebApiHandler =>
  async (req) => {
    const adapter = new WebApiAdapter(req);
    const useCase = new RegisterActionHandler(adapter);
    const result = await useCase.handleAction(config);
    return adapter.send(result);
  };
