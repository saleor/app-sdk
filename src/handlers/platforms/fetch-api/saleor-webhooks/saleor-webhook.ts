import { createDebug } from "@/debug";
import {
  GenericSaleorWebhook,
  GenericWebhookConfig,
} from "@/handlers/shared/generic-saleor-webhook";
import { WebhookContext } from "@/handlers/shared/process-saleor-webhook";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { AsyncWebhookEventType, SyncWebhookEventType } from "@/types";

import { WebApiAdapter, WebApiHandler, WebApiHandlerInput } from "../platform-adapter";

const debug = createDebug("SaleorWebhook");

export type WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> =
  GenericWebhookConfig<WebApiHandlerInput, Event>;

/** Function type provided by consumer in `SaleorWebApiWebhook.createHandler` */
export type SaleorWebhookHandler<TPayload = unknown, TExtras = {}> = (
  req: Request,
  ctx: WebhookContext<TPayload> & TExtras
) => Response | Promise<Response>;

export abstract class SaleorWebApiWebhook<
  TPayload = unknown,
  TExtras extends Record<string, unknown> = {}
> extends GenericSaleorWebhook<WebApiHandlerInput, TPayload, TExtras> {
  createHandler(handlerFn: SaleorWebhookHandler<TPayload, TExtras>): WebApiHandler {
    return async (req) => {
      const adapter = new WebApiAdapter(req);
      const validator = new SaleorWebhookValidator(adapter);
      const prepareRequestResult = await super.prepareRequest<WebApiAdapter>({
        adapter,
        validator,
      });

      if (prepareRequestResult.result === "sendResponse") {
        return prepareRequestResult.response;
      }

      debug("Incoming request validated. Call handlerFn");
      return handlerFn(req, {
        ...(this.extraContext ?? ({} as TExtras)),
        ...prepareRequestResult.context,
      });
    };
  }
}
