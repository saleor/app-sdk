import { NextApiHandler } from "next";

import { AsyncWebhookEventType } from "../../../types";
import { NextWebhookApiHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  event: AsyncWebhookEventType;

  protected type = "async" as const;

  constructor(configuration: WebhookConfig<AsyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextWebhookApiHandler<TPayload>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
