import { ASTNode } from "graphql";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { WebhookManifest } from "../..";
import { APL } from "../../APL";
import { createDebug } from "../../debug";
import { gqlAstToString } from "../../gql-ast-to-string";
import { WebhookEvent } from "../../types";
import {
  processAsyncSaleorWebhook,
  SaleorWebhookError,
  WebhookContext,
  WebhookError,
} from "./process-async-saleor-webhook";

const debug = createDebug("SaleorAsyncWebhook");

export interface WebhookManifestConf {
  name?: string;
  webhookPath: string;
  subscriptionQueryAst?: ASTNode;
  query?: string;
  asyncEvent: WebhookEvent;
  isActive?: boolean;
  apl: APL;
}

export const ErrorCodeMap: Record<SaleorWebhookError, number> = {
  OTHER: 500,
  MISSING_HOST_HEADER: 400,
  MISSING_DOMAIN_HEADER: 400,
  MISSING_EVENT_HEADER: 400,
  MISSING_PAYLOAD_HEADER: 400,
  MISSING_SIGNATURE_HEADER: 400,
  MISSING_REQUEST_BODY: 400,
  WRONG_EVENT: 400,
  NOT_REGISTERED: 401,
  SIGNATURE_VERIFICATION_FAILED: 401,
  WRONG_METHOD: 405,
  CANT_BE_PARSED: 400,
};

export type NextWebhookApiHandler<TPayload, TResp = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<TResp>,
  ctx: WebhookContext<TPayload>
) => unknown | Promise<unknown>;

export class SaleorAsyncWebhook<TPayload = unknown> {
  name: string;

  webhookPath: string;

  subscriptionQueryAst?: ASTNode;

  query?: string;

  asyncEvent: WebhookEvent;

  isActive?: boolean;

  apl: APL;

  constructor({
    name,
    webhookPath,
    subscriptionQueryAst,
    query,
    asyncEvent,
    apl,
    isActive = true,
  }: WebhookManifestConf) {
    this.name = name || `${asyncEvent} webhook`;
    this.subscriptionQueryAst = subscriptionQueryAst;
    this.query = query;
    this.webhookPath = webhookPath;
    this.asyncEvent = asyncEvent;
    this.isActive = isActive;
    this.apl = apl;
  }

  /**
   * Returns full URL to the webhook, based on provided baseUrl.
   *
   * @param baseUrl Base URL used by your application
   */
  targetUrl(baseUrl: string) {
    return new URL(this.webhookPath, baseUrl).href;
  }

  /**
   * Returns synchronous event manifest for this webhook.
   *
   * @param baseUrl Base URL used by your application
   * @returns WebhookManifest
   */
  getWebhookManifest(baseUrl: string): WebhookManifest {
    return {
      name: this.name,
      targetUrl: this.targetUrl(baseUrl),
      asyncEvents: [this.asyncEvent],
      isActive: this.isActive,
      // Query can be provided as plaintext..
      ...(this.query && { query: this.query }),
      // ...GQL AST which has to be stringified..
      ...(this.subscriptionQueryAst && { query: gqlAstToString(this.subscriptionQueryAst) }),
      // or no query at all. In such case default webhook payload will be sent
    };
  }

  /**
   * Wraps provided function, to ensure incoming request comes from registered Saleor instance.
   * Also provides additional `context` object containing typed payload and request properties.
   *
   * @param handlerFn NextApiHandler function which takes additional `context` argument
   * @returns NextApiHandler
   */
  createHandler(handlerFn: NextWebhookApiHandler<TPayload>): NextApiHandler {
    return async (req, res) => {
      await processAsyncSaleorWebhook<TPayload>({
        req,
        apl: this.apl,
        allowedEvent: this.asyncEvent,
      })
        .then(async (context) => {
          debug("Call handlerFn");
          return handlerFn(req, res, context);
        })
        .catch((e) => {
          if (e instanceof WebhookError) {
            debug(e.message);
            res.status(ErrorCodeMap[e.errorType] || 400).end();
            return;
          }
          debug("Unexpected error during processing the webhook %O", e);
          res.status(500).end();
        });
    };
  }
}
