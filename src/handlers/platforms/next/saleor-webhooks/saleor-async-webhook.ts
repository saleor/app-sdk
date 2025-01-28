import { ASTNode } from "graphql/index";
import { NextApiHandler } from "next";

import { AsyncWebhookEventType } from "../../../types";
import { NextWebhookApiHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";

export class SaleorAsyncWebhook<TPayload = unknown> extends SaleorWebhook<TPayload> {
  readonly event: AsyncWebhookEventType;

  protected readonly eventType = "async" as const;

  constructor(
    /**
     * Omit new required fields and make them optional. Validate in constructor.
     * In 0.35.0 remove old fields
     */
    configuration: Omit<WebhookConfig<AsyncWebhookEventType>, "event" | "query"> & {
      /**
       * @deprecated - use `event` instead. Will be removed in 0.35.0
       */
      asyncEvent?: AsyncWebhookEventType;
      event?: AsyncWebhookEventType;
      query?: string | ASTNode;
    }
  ) {
    if (!configuration.event && !configuration.asyncEvent) {
      throw new Error("event or asyncEvent must be provided. asyncEvent is deprecated");
    }

    if (!configuration.query && !configuration.subscriptionQueryAst) {
      throw new Error(
        "query or subscriptionQueryAst must be provided. subscriptionQueryAst is deprecated"
      );
    }

    super({
      ...configuration,
      event: configuration.event! ?? configuration.asyncEvent!,
      query: configuration.query! ?? configuration.subscriptionQueryAst!,
    });

    this.event = configuration.event! ?? configuration.asyncEvent!;
    this.query = configuration.query! ?? configuration.subscriptionQueryAst!;
  }

  createHandler(handlerFn: NextWebhookApiHandler<TPayload>): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}
