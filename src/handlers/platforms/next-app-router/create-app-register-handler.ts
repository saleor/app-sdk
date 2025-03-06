import { RegisterActionHandler } from "@/handlers/actions/register-action-handler";
import { GenericCreateAppRegisterHandlerOptions } from "@/handlers/shared/create-app-register-handler-types";

import {
  NextAppRouterAdapter,
  NextAppRouterHandler,
  NextAppRouterHandlerInput,
} from "./platform-adapter";

export type CreateAppRegisterHandlerOptions =
  GenericCreateAppRegisterHandlerOptions<NextAppRouterHandlerInput>;

export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions): NextAppRouterHandler =>
  async (req) => {
    const adapter = new NextAppRouterAdapter(req);
    const useCase = new RegisterActionHandler(adapter);
    const result = await useCase.handleAction(config);

    return adapter.send(result);
  };
