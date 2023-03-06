import { NextApiHandler } from "next";

import { AsyncWebhookEventType } from "../../../types";
import { NextWebhookApiHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(
    configuration: WebhookConfig<AsyncWebhookEventType> & {
      /**
       * @deprecated - use `event` instead. Will be removed in 0.35.0
       */
      asyncEvent?: AsyncWebhookEventType;
    }
  ) {
    super({
      ...configuration,
      event: configuration.event ?? configuration.asyncEvent,
    });

    this.event = configuration.event ?? configuration.asyncEvent;
  }

  createHandler(handlerFn: NextWebhookApiHandler<TPayload>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
