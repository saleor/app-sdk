import { APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";

import { createDebug } from "@/debug";
import {
  GenericSaleorWebhook,
  GenericWebhookConfig,
} from "@/handlers/shared/generic-saleor-webhook";
import { WebhookContext } from "@/handlers/shared/saleor-webhook";
import { AsyncWebhookEventType, SyncWebhookEventType } from "@/types";

import { AwsLambdaAdapter, AWSLambdaHandler, AwsLambdaHandlerInput } from "../platform-adapter";

const debug = createDebug("SaleorWebhook");

export type WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> =
  GenericWebhookConfig<AwsLambdaHandlerInput, Event>;

/** Function type provided by consumer in `SaleorWebApiWebhook.createHandler` */
export type AwsLambdaWebhookHandler<TPayload = unknown, TExtras = {}> = (
  event: AwsLambdaHandlerInput,
  context: Context,
  ctx: WebhookContext<TPayload> & TExtras
) => Promise<APIGatewayProxyStructuredResultV2> | APIGatewayProxyStructuredResultV2;

export abstract class SaleorWebApiWebhook<
  TPayload = unknown,
  TExtras extends Record<string, unknown> = {}
> extends GenericSaleorWebhook<AwsLambdaHandlerInput, TPayload, TExtras> {
  /**
   * Wraps provided function, to ensure incoming request comes from registered Saleor instance.
   * Also provides additional `context` object containing typed payload and request properties.
   */
  createHandler(handlerFn: AwsLambdaWebhookHandler<TPayload, TExtras>): AWSLambdaHandler {
    return async (event, context) => {
      const adapter = new AwsLambdaAdapter(event, context);
      const prepareRequestResult = await super.prepareRequest<AwsLambdaAdapter>(adapter);

      if (prepareRequestResult.result === "sendResponse") {
        return prepareRequestResult.response;
      }

      debug("Incoming request validated. Call handlerFn");
      return handlerFn(event, context, {
        ...(this.extraContext ?? ({} as TExtras)),
        ...prepareRequestResult.context,
      });
    };
  }
}
