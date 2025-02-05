import { NextApiHandler } from "next";

import { SyncWebhookInjectedContext } from "@/handlers/shared";
import { buildSyncWebhookResponsePayload } from "@/handlers/shared/sync-webhook-response-builder";
import { SyncWebhookEventType } from "@/types";

import { NextJsWebhookHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export type NextJsSyncWebhookHandler<
  TPayload,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> = NextJsWebhookHandler<TPayload, SyncWebhookInjectedContext<TEvent>>;

export class SaleorSyncWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> extends SaleorWebhook<TPayload, SyncWebhookInjectedContext<TEvent>> {
  readonly event: TEvent;

  protected readonly eventType = "sync" as const;

  protected extraContext = {
    buildResponse: buildSyncWebhookResponsePayload,
  };

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextJsSyncWebhookHandler<TPayload, TEvent>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
