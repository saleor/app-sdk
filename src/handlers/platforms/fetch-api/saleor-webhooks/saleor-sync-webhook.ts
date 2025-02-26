import { SyncWebhookEventType } from "@/types";

import { WebApiHandler } from "../platform-adapter";
import { SaleorWebApiWebhook, WebApiWebhookHandler, WebhookConfig } from "./saleor-webhook";

export type WebApiSyncWebhookHandler<TPayload> = WebApiWebhookHandler<TPayload>;

export class SaleorSyncWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType,
> extends SaleorWebApiWebhook<TPayload> {
  readonly event: TEvent;

  protected readonly eventType = "sync" as const;

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: WebApiSyncWebhookHandler<TPayload>): WebApiHandler {
    return super.createHandler(handlerFn);
  }
}
