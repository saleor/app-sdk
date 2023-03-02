import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { SyncWebhookEventType } from "../../../types";
import { WebhookContext } from "./process-saleor-webhook";
import { SaleorWebhook, WebhookConfig } from "./saleor-webhook";
import { buildSyncWebhookResponsePayload } from "./sync-webhook-response-builder";

type NextWebhookApiHandler<
  TPayload = unknown,

  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> = (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: WebhookContext<TPayload> & {
    responseBuilder: typeof buildSyncWebhookResponsePayload<TEvent>;
  }
) => unknown | Promise<unknown>;

export class SyncSaleorWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> extends SaleorWebhook<TPayload> {
  event: TEvent;

  protected type = "sync" as const;

  protected extraContext = {
    responseBuilder: buildSyncWebhookResponsePayload,
  };

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextWebhookApiHandler<TPayload, TEvent>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}

new SyncSaleorWebhook({ event: "ORDER_CALCULATE_TAXES" }).createHandler((req, res, ctx) => {
  ctx.responseBuilder("");
});
