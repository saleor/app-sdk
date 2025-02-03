import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { createDebug } from "@/debug";
import {
  GenericSaleorWebhook,
  GenericWebhookConfig,
} from "@/handlers/shared/generic-saleor-webhook";
import { WebhookContext } from "@/handlers/shared/saleor-webhook";
import { AsyncWebhookEventType, SyncWebhookEventType } from "@/types";

import { NextJsAdapter } from "../platform-adapter";

const debug = createDebug("SaleorWebhook");

export type WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> =
  GenericWebhookConfig<NextApiRequest, Event>;

export type NextJsWebhookHandler<TPayload = unknown, TExtras = {}> = (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: WebhookContext<TPayload> & TExtras
) => unknown | Promise<unknown>;

export abstract class SaleorWebhook<
  TPayload = unknown,
  TExtras extends Record<string, unknown> = {}
> extends GenericSaleorWebhook<NextApiRequest, TPayload, TExtras> {
  /**
   * Wraps provided function, to ensure incoming request comes from registered Saleor instance.
   * Also provides additional `context` object containing typed payload and request properties.
   */
  createHandler(handlerFn: NextJsWebhookHandler<TPayload, TExtras>): NextApiHandler {
    return async (req, res) => {
      const adapter = new NextJsAdapter(req, res);
      const prepareRequestResult = await super.prepareRequest<NextJsAdapter>(adapter);

      if (prepareRequestResult.result === "sendResponse") {
        return prepareRequestResult.response;
      }

      debug("Incoming request validated. Call handlerFn");
      return handlerFn(req, res, {
        ...(this.extraContext ?? ({} as TExtras)),
        ...prepareRequestResult.context,
      });
    };
  }
}
