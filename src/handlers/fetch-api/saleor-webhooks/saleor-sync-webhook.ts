import { SyncWebhookEventType } from "../../../types";
import { buildSyncWebhookResponsePayload } from "../../shared/sync-webhook-response-builder";
import { SaleorWebApiWebhook, WebApiWebhookHandler, WebhookConfig } from "./saleor-webhook";

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
    handlerFn: WebApiWebhookHandler<
      TPayload,
      {
        buildResponse: typeof buildSyncWebhookResponsePayload<TEvent>;
      }
    >
  ): WebApiWebhookHandler {
    return super.createHandler(handlerFn);
  }
}
