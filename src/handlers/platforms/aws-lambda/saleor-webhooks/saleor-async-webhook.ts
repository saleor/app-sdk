import { AsyncWebhookEventType } from "@/types";

import { AWSLambdaHandler } from "../platform-adapter";
import { AwsLambdaWebhookHandler, SaleorWebApiWebhook, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebApiWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(configuration: WebhookConfig<AsyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: AwsLambdaWebhookHandler<TPayload>): AWSLambdaHandler {
    return super.createHandler(handlerFn);
  }
}
