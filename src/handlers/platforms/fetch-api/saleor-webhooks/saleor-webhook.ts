import { createDebug } from "@/debug";
import {
  GenericSaleorWebhook,
  GenericWebhookConfig,
} from "@/handlers/shared/generic-saleor-webhook";
import { WebhookContext } from "@/handlers/shared/saleor-webhook";
import { AsyncWebhookEventType, SyncWebhookEventType } from "@/types";

import { WebApiAdapter, WebApiHandler, WebApiHandlerInput } from "../platform-adapter";

const debug = createDebug("SaleorWebhook");

export type WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> =
  GenericWebhookConfig<WebApiHandlerInput, Event>;

/** Function type provided by consumer in `SaleorWebApiWebhook.createHandler` */
export type WebApiWebhookHandler<TPayload = unknown> = (
  req: Request,
  ctx: WebhookContext<TPayload>,
) => Response | Promise<Response>;

export abstract class SaleorWebApiWebhook<TPayload = unknown> extends GenericSaleorWebhook<
  WebApiHandlerInput,
  TPayload
> {
  createHandler(handlerFn: WebApiWebhookHandler<TPayload>): WebApiHandler {
    return async (req) => {
      const adapter = new WebApiAdapter(req);
      const prepareRequestResult = await super.prepareRequest<WebApiAdapter>(adapter);

      if (prepareRequestResult.result === "sendResponse") {
        return prepareRequestResult.response;
      }

      debug("Incoming request validated. Call handlerFn");
      return handlerFn(req, {
        ...prepareRequestResult.context,
      });
    };
  }
}
