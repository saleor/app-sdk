import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";

import { APL } from "@/APL";
import {
  ProtectedActionValidator,
  ProtectedHandlerContext,
} from "@/handlers/shared/protected-action-validator";
import { Permission } from "@/types";

import { AwsLambdaAdapter, AWSLambdaHandler } from "./platform-adapter";

export type AwsLambdaProtectedHandler = (
  event: APIGatewayProxyEventV2,
  context: Context,
  saleorContext: ProtectedHandlerContext
) => Promise<APIGatewayProxyStructuredResultV2>;

/**
 * Wraps provided function, to ensure incoming request comes from Saleor Dashboard.
 * Also provides additional `saleorContext` object containing request properties.
 */
export const createProtectedHandler =
  (
    handlerFn: AwsLambdaProtectedHandler,
    apl: APL,
    requiredPermissions?: Permission[]
  ): AWSLambdaHandler =>
  async (event, context) => {
    const adapter = new AwsLambdaAdapter(event, context);
    const actionValidator = new ProtectedActionValidator(adapter);
    const validationResult = await actionValidator.validateRequest({
      apl,
      requiredPermissions,
    });

    if (validationResult.result === "failure") {
      return adapter.send(validationResult.value);
    }

    const saleorContext = validationResult.value;
    try {
      return await handlerFn(event, context, saleorContext);
    } catch (err) {
      return {
        statusCode: 500,
        body: "Unexpected Server Error",
      };
    }
  };
