import { APIGatewayProxyEventV2, Context } from "aws-lambda";

import { GenericCreateAppRegisterHandlerOptions } from "../shared/create-app-register-handler-types";
import { ManifestUseCase } from "../shared/manifest-use-case";
import { AwsLambdaAdapter, AWSLambdaHandler, WebApiHandlerInput } from "./platform-adapter";

export type RegisterHandlerResponseBody = {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
  };
};

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
  (config: CreateAppRegisterHandlerOptions): AWSLambdaHandler =>
  async (event: APIGatewayProxyEventV2, context: Context) => {
    const adapter = new AwsLambdaAdapter(event, context);
    const useCase = new ManifestUseCase({ adapter, config });
    const result = await useCase.getResult();
    return adapter.send(result);
  };
