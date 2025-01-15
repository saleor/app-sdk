import { GenericCreateAppRegisterHandlerOptions } from "../shared/create-app-register-handler-types";
import { ManifestUseCase, RegisterHandlerResponseBody } from "../shared/manifest-use-case";
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
    const useCase = new ManifestUseCase({ adapter, config });
    const result = await useCase.getResult();
    return adapter.send(result);
  };
