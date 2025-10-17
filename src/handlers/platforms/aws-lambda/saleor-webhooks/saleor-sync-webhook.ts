import { SyncWebhookEventType } from "@/types";

import { AWSLambdaHandler } from "../platform-adapter";
import { AwsLambdaWebhookHandler, SaleorWebApiWebhook, WebhookConfig } from "./saleor-webhook";

export type AwsLambdaSyncWebhookHandler<TPayload> = AwsLambdaWebhookHandler<TPayload>;

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

  createHandler(handlerFn: AwsLambdaSyncWebhookHandler<TPayload>): AWSLambdaHandler {
    return super.createHandler(handlerFn);
  }
}
