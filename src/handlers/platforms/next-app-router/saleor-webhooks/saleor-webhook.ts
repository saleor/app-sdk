import { NextRequest, NextResponse } from "next/server";

import { createDebug } from "@/debug";
import { WebApiWebhookHandler } from "@/handlers/platforms/fetch-api";
import {
  GenericSaleorWebhook,
  GenericWebhookConfig,
} from "@/handlers/shared/generic-saleor-webhook";
import { AsyncWebhookEventType, SyncWebhookEventType } from "@/types";

import {
  NextAppRouterAdapter,
  NextAppRouterHandler,
  NextAppRouterHandlerInput,
} from "../platform-adapter";

const debug = createDebug("SaleorWebhook");

export type WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> =
  GenericWebhookConfig<NextAppRouterHandlerInput, Event>;

export type NextAppRouterWebhookHandler<
  TPayload = unknown,
  TRequest extends NextRequest = NextRequest,
  TResponse extends NextResponse = NextResponse,
> = WebApiWebhookHandler<TPayload, TRequest, TResponse>;

export abstract class SaleorNextAppRouterWebhook<TPayload = unknown> extends GenericSaleorWebhook<
  NextAppRouterHandlerInput,
  TPayload
> {
  createHandler(handlerFn: NextAppRouterWebhookHandler<TPayload>): NextAppRouterHandler {
    return async (req): Promise<NextResponse> => {
      const adapter = new NextAppRouterAdapter(req);
      const prepareRequestResult = await super.prepareRequest<NextAppRouterAdapter>(adapter);

      if (prepareRequestResult.result === "sendResponse") {
        return prepareRequestResult.response;
      }

      debug("Incoming request validated. Call handlerFn");
      return handlerFn(req, {
        ...prepareRequestResult.context,
      });
    };
  }
}
