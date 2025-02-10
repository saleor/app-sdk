import { SyncWebhookInjectedContext } from "@/handlers/shared";
import { buildSyncWebhookResponsePayload } from "@/handlers/shared/sync-webhook-response-builder";
import { SyncWebhookEventType } from "@/types";

import { AWSLambdaHandler } from "../platform-adapter";
import { AwsLambdaWebhookHandler, SaleorWebApiWebhook, WebhookConfig } from "./saleor-webhook";

export type AwsLambdaSyncWebhookHandler<
  TPayload,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> = AwsLambdaWebhookHandler<TPayload, SyncWebhookInjectedContext<TEvent>>;

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

  createHandler(handlerFn: AwsLambdaSyncWebhookHandler<TPayload, TEvent>): AWSLambdaHandler {
    return super.createHandler(handlerFn);
  }
}
