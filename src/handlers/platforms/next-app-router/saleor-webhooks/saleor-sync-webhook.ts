import { SyncWebhookEventType } from "@/types";

import { NextAppRouterHandler } from "../platform-adapter";
import {
  NextAppRouterWebhookHandler,
  SaleorNextAppRouterWebhook,
  WebhookConfig,
} from "./saleor-webhook";

export type NextAppRouterSyncWebhookHandler<TPayload> = NextAppRouterWebhookHandler<TPayload>;

export class SaleorSyncWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType,
> extends SaleorNextAppRouterWebhook<TPayload> {
  readonly event: TEvent;

  protected readonly eventType = "sync" as const;

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(handlerFn: NextAppRouterSyncWebhookHandler<TPayload>): NextAppRouterHandler {
    return super.createHandler(handlerFn);
  }
}
