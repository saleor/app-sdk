import { GenericCreateAppRegisterHandlerOptions } from "../shared/create-app-register-handler-types";
import {
  RegisterActionHandler,
  RegisterHandlerResponseBody,
} from "../shared/register-action-handler";
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

export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions): WebApiHandler =>
  async (req: Request) => {
    const adapter = new WebApiAdapter(req);
    const useCase = new RegisterActionHandler(adapter);
    const result = await useCase.handleAction(config);
    return adapter.send(result);
  };
