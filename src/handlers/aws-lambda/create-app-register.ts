import { APIGatewayProxyEventV2, Context } from "aws-lambda";

import { GenericCreateAppRegisterHandlerOptions } from "../shared/create-app-register-handler-types";
import {
  RegisterActionHandler,
  RegisterHandlerResponseBody,
} from "../shared/register-action-handler";
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

/**
 * Returns API route handler for AWS Lambda HTTP triggered events
 * (created by Amazon API Gateway, Lambda Function URL)
 * that use signature: (event: APIGatewayProxyEventV2, context: Context) => APIGatewayProxyResultV2
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
 * @see {@link https://www.npmjs.com/package/@types/aws-lambda}
 * */
export const createAppRegisterHandler =
  (config: CreateAppRegisterHandlerOptions): AWSLambdaHandler =>
  async (event: APIGatewayProxyEventV2, context: Context) => {
    const adapter = new AwsLambdaAdapter(event, context);
    const useCase = new RegisterActionHandler(adapter);
    const result = await useCase.handleAction(config);
    return adapter.send(result);
  };
