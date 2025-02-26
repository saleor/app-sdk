import { NextApiHandler } from "next";

import { SyncWebhookEventType } from "@/types";

import { NextJsWebhookHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export type NextJsSyncWebhookHandler<TPayload> = NextJsWebhookHandler<TPayload>;

export class SaleorSyncWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType,
> extends SaleorWebhook<TPayload> {
  readonly event: TEvent;

  protected readonly eventType = "sync" as const;

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextJsSyncWebhookHandler<TPayload>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
