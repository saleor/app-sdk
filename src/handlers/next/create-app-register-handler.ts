import { NextApiRequest, NextApiResponse } from "next";

import { GenericCreateAppRegisterHandlerOptions } from "../shared/create-app-register-handler-types";
import {
  RegisterActionHandler,
  RegisterHandlerResponseBody,
} from "../shared/register-action-handler";
import { NextJsAdapter, NextJsHandlerInput } from "./platform-adapter";

// Re-export types for backwards compatibility

export type { RegisterHandlerResponseBody };

export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"]
): RegisterHandlerResponseBody => ({
  success,
  error,
});

// Request type is from retest (Next.js interface)
export type CreateAppRegisterHandlerOptions =
  GenericCreateAppRegisterHandlerOptions<NextJsHandlerInput>;

export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const adapter = new NextJsAdapter(req, res);
    const useCase = new RegisterActionHandler(adapter);
    const result = await useCase.handleAction(config);
    return adapter.send(result);
  };
