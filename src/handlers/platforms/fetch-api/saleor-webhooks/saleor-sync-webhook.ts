import { buildSyncWebhookResponsePayload } from "@/handlers/shared/sync-webhook-response-builder";
import { SyncWebhookEventType } from "@/types";

import { WebApiHandler } from "../platform-adapter";
import { SaleorWebApiWebhook, SaleorWebhookHandler, WebhookConfig } from "./saleor-webhook";

type InjectedContext<TEvent extends SyncWebhookEventType> = {
  buildResponse: typeof buildSyncWebhookResponsePayload<TEvent>;
};
export class SaleorSyncWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> extends SaleorWebApiWebhook<TPayload, InjectedContext<TEvent>> {
  readonly event: TEvent;

  protected readonly eventType = "sync" as const;

  protected extraContext = {
    buildResponse: buildSyncWebhookResponsePayload,
  };

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(
    handlerFn: SaleorWebhookHandler<
      TPayload,
      {
        buildResponse: typeof buildSyncWebhookResponsePayload<TEvent>;
      }
    >
  ): WebApiHandler {
    return super.createHandler(handlerFn);
  }
}
