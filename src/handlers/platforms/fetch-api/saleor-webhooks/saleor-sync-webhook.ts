import { SyncWebhookInjectedContext } from "@/handlers/shared";
import { buildSyncWebhookResponsePayload } from "@/handlers/shared/sync-webhook-response-builder";
import { SyncWebhookEventType } from "@/types";

import { WebApiHandler } from "../platform-adapter";
import { SaleorWebApiWebhook, WebApiWebhookHandler, WebhookConfig } from "./saleor-webhook";

export type WebApiSyncWebhookHandler<
  TPayload,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> = WebApiWebhookHandler<TPayload, InjectedContext<TEvent>>;

export class SaleorSyncWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> extends SaleorWebApiWebhook<TPayload, SyncWebhookInjectedContext<TEvent>> {
  readonly event: TEvent;

  protected readonly eventType = "sync" as const;

  protected extraContext = {
    buildResponse: buildSyncWebhookResponsePayload,
  };

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: WebApiSyncWebhookHandler<TPayload, TEvent>): WebApiHandler {
    return super.createHandler(handlerFn);
  }
}
