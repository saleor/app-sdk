import { AsyncWebhookEventType } from "@/types";

import { NextAppRouterHandler } from "../platform-adapter";
import {
  NextAppRouterWebhookHandler,
  SaleorNextAppRouterWebhook,
  WebhookConfig,
} from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorNextAppRouterWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(configuration: WebhookConfig<AsyncWebhookEventType>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextAppRouterWebhookHandler<TPayload>): NextAppRouterHandler {
    return super.createHandler(handlerFn);
  }
}
