import { SyncWebhookEventType } from "../../../types";
import { SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class SyncSaleorWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  event: SyncWebhookEventType;

  type = "sync" as const;

  constructor(configuration: WebhookConfig<SyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }
}
