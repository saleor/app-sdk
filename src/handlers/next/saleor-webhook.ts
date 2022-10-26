import { ASTNode } from "graphql";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { APL } from "../../APL";
import { gqlAstToString } from "../../gql-ast-to-string";
import { AppWebhook, WebhookEvent } from "../../types";
import { processSaleorWebhook, WebhookContext, WebhookError } from "./process-saleor-webhook";

export interface WebhookManifestConf {
  name?: string;
  webhookUrl: string;
  subscriptionQueryAst?: ASTNode;
  query?: string;
  asyncEvent: WebhookEvent;
  isActive?: boolean;
  apl: APL;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type NextWebhookApiHandler<TPayload, TResp = any> = (
  req: NextApiRequest,
  res: NextApiResponse<TResp>,
  ctx: WebhookContext<TPayload>
) => unknown | Promise<unknown>;

export class SaleorWebhook<TPayload = unknown> {
  name: string;

  webhookUrl: string;

  subscriptionQueryAst?: ASTNode;

  query?: string;

  asyncEvent: WebhookEvent;

  isActive?: boolean;

  apl: APL;

  constructor({
    name,
    webhookUrl,
    subscriptionQueryAst,
    query,
    asyncEvent,
    apl,
    isActive = true,
  }: WebhookManifestConf) {
    this.name = name || `${asyncEvent} webhook`;
    this.subscriptionQueryAst = subscriptionQueryAst;
    this.query = query;
    this.webhookUrl = webhookUrl;
    this.asyncEvent = asyncEvent;
    this.isActive = isActive;
    this.apl = apl;
  }

  targetUrl(baseUrl: string) {
    return new URL(this.webhookUrl, baseUrl).href;
  }

  getManifest(baseUrl: string): AppWebhook {
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

  handler(handlerFn: NextWebhookApiHandler<TPayload>): NextApiHandler {
    return async (req, res) => {
      let context;
      try {
        context = await processSaleorWebhook<TPayload>({
          req,
          apl: this.apl,
          allowedEvent: this.asyncEvent,
        });
      } catch (e) {
        if (e instanceof WebhookError) {
          console.error(e.message);
          res.status(e.httpResponseCode).end();
          return;
        }
        console.error("Unexpected error during processing the webhook", e);
        res.status(500).end();
        return;
      }
      await handlerFn(req, res, context);
    };
  }
}
