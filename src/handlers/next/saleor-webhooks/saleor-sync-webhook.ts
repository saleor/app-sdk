import { NextApiHandler } from "next";

import { APL } from "../../../APL";
import { SyncWebhookEventType } from "../../../types";
import { NextWebhookApiHandler, SaleorWebhook, WebhookConfig } from "./saleor-webhook";
import { buildSyncWebhookResponsePayload } from "./sync-webhook-response-builder";

type InjectedContext<TEvent extends SyncWebhookEventType> = {
  responseBuilder: typeof buildSyncWebhookResponsePayload<TEvent>;
};

export class SyncSaleorWebhook<
  TPayload = unknown,
  TEvent extends SyncWebhookEventType = SyncWebhookEventType
> extends SaleorWebhook<TPayload, InjectedContext<TEvent>> {
  event: TEvent;

  protected type = "sync" as const;

  protected extraContext = {
    responseBuilder: buildSyncWebhookResponsePayload,
  };

  constructor(configuration: WebhookConfig<TEvent>) {
    super(configuration);

    this.event = configuration.event;
  }

  createHandler(
    handlerFn: NextWebhookApiHandler<
      TPayload,
      {
        responseBuilder: typeof buildSyncWebhookResponsePayload<TEvent>;
      }
    >
  ): NextApiHandler {
    return super.createHandler(handlerFn);
  }
}

// todo this is example
new SyncSaleorWebhook({
  event: "CHECKOUT_CALCULATE_TAXES",
  apl: {} as APL,
  query: "",
  webhookPath: "",
}).createHandler((req, res, ctx) => res.send(
    ctx.responseBuilder({
      foo: "asd",
    })
  ));
