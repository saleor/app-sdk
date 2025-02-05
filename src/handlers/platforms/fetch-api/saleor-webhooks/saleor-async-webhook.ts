import { AsyncWebhookEventType } from "@/types";

import { WebApiHandler } from "../platform-adapter";
import { SaleorWebApiWebhook, WebApiWebhookHandler, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebApiWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(configuration: WebhookConfig<AsyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: WebApiWebhookHandler<TPayload>): WebApiHandler {
    return super.createHandler(handlerFn);
  }
}
