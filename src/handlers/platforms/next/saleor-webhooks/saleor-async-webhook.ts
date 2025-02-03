import { NextApiHandler } from "next";

import { AsyncWebhookEventType } from "@/types";

import { NextJsWebhookHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(configuration: WebhookConfig<AsyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextJsWebhookHandler<TPayload>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
