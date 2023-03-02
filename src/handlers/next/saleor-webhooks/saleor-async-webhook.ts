import { AsyncWebhookEventType } from "../../../types";
import { SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class AsyncSaleorWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  event: AsyncWebhookEventType;

  type = "async" as const;

  constructor(configuration: WebhookConfig<AsyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }
}

