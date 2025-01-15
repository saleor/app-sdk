import { APIGatewayProxyEventV2, Context } from "aws-lambda";

import { GenericCreateAppRegisterHandlerOptions } from "../shared/create-app-register-handler-types";
import { ManifestUseCase, RegisterHandlerResponseBody } from "../shared/manifest-use-case";
import { AwsLambdaAdapter, AWSLambdaHandler, AwsLambdaHandlerInput } from "./platform-adapter";

export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"]
): RegisterHandlerResponseBody => ({
  success,
  error,
});

export type CreateAppRegisterHandlerOptions =
  GenericCreateAppRegisterHandlerOptions<AwsLambdaHandlerInput>;

export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions): AWSLambdaHandler =>
  async (event: APIGatewayProxyEventV2, context: Context) => {
    const adapter = new AwsLambdaAdapter(event, context);
    const useCase = new ManifestUseCase({ adapter, config });
    const result = await useCase.getResult();
    return adapter.send(result);
  };
