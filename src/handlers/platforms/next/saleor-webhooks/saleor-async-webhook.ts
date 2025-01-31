import { ASTNode } from "graphql/index";
import { NextApiHandler } from "next";

import { AsyncWebhookEventType } from "@/types";

import { NextJsWebhookHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(
    configuration: Omit<WebhookConfig<AsyncWebhookEventType>, "event" | "query"> & {
      event?: AsyncWebhookEventType;
      query?: string | ASTNode;
    }
  ) {
    if (!configuration.event) {
      throw new Error("event must be provided.");
    }

    if (!configuration.query) {
      throw new Error("query must be provided.");
    }

    super({
      ...configuration,
      event: configuration.event,
      query: configuration.query,
    });

    this.event = configuration.event;
    this.query = configuration.query;
  }

  createHandler(handlerFn: NextJsWebhookHandler<TPayload>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
