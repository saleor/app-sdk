import { ASTNode } from "graphql";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { APL } from "../../APL";
import { createDebug } from "../../debug";
import { gqlAstToString } from "../../gql-ast-to-string";
import { AsyncWebhookEventType, WebhookManifest } from "../../types";
import {
  processAsyncSaleorWebhook,
  SaleorWebhookError,
  WebhookContext,
  WebhookError,
} from "./process-async-saleor-webhook";

const debug = createDebug("SaleorAsyncWebhook");

interface WebhookManifestConfigurationBase {
  name?: string;
  webhookPath: string;
  asyncEvent: AsyncWebhookEventType;
  isActive?: boolean;
  apl: APL;
  onError?(error: WebhookError | Error, req: NextApiRequest, res: NextApiResponse): void;
  formatErrorResponse?(
    error: WebhookError | Error,
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<{
    code: number;
    body: object | string;
  }>;
}

interface WebhookManifestConfigurationWithAst extends WebhookManifestConfigurationBase {
  subscriptionQueryAst: ASTNode;
}

interface WebhookManifestConfigurationWithQuery extends WebhookManifestConfigurationBase {
  query: string;
}

type WebhookManifestConfiguration =
  | WebhookManifestConfigurationWithAst
  | WebhookManifestConfigurationWithQuery;

export const AsyncWebhookErrorCodeMap: Record<SaleorWebhookError, number> = {
  OTHER: 500,
  MISSING_HOST_HEADER: 400,
  MISSING_DOMAIN_HEADER: 400,
  MISSING_API_URL_HEADER: 400,
  MISSING_EVENT_HEADER: 400,
  MISSING_PAYLOAD_HEADER: 400,
  MISSING_SIGNATURE_HEADER: 400,
  MISSING_REQUEST_BODY: 400,
  WRONG_EVENT: 400,
  NOT_REGISTERED: 401,
  SIGNATURE_VERIFICATION_FAILED: 401,
  WRONG_METHOD: 405,
  CANT_BE_PARSED: 400,
  CONFIGURATION_ERROR: 500,
};

export type NextWebhookApiHandler<TPayload = unknown, TResp = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<TResp>,
  ctx: WebhookContext<TPayload>
) => unknown | Promise<unknown>;

export class SaleorAsyncWebhook<TPayload = unknown> {
  name: string;

  webhookPath: string;

  subscriptionQueryAst?: ASTNode;

  query?: string;

  asyncEvent: AsyncWebhookEventType;

  isActive?: boolean;

  apl: APL;

  onError: WebhookManifestConfigurationBase["onError"];

  formatErrorResponse: WebhookManifestConfigurationBase["formatErrorResponse"];

  constructor(configuration: WebhookManifestConfiguration) {
    const { name, webhookPath, asyncEvent, apl, isActive = true } = configuration;
    this.name = name || `${asyncEvent} webhook`;
    if ("query" in configuration) {
      this.query = configuration.query;
    }
    if ("subscriptionQueryAst" in configuration) {
      this.subscriptionQueryAst = configuration.subscriptionQueryAst;
    }
    if (!this.subscriptionQueryAst && !this.query) {
      throw new WebhookError(
        "Need to specify `subscriptionQueryAst` or `query` to create webhook subscription",
        "CONFIGURATION_ERROR"
      );
    }

    this.webhookPath = webhookPath;
    this.asyncEvent = asyncEvent;
    this.isActive = isActive;
    this.apl = apl;
    this.onError = configuration.onError;
    this.formatErrorResponse = configuration.formatErrorResponse;
  }

  /**
   * Returns full URL to the webhook, based on provided baseUrl.
   *
   * TODO: Shouldn't it be private?
   *
   * @param baseUrl Base URL used by your application
   */
  getTargetUrl(baseUrl: string) {
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
      targetUrl: this.getTargetUrl(baseUrl),
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
   */
  createHandler(handlerFn: NextWebhookApiHandler<TPayload>): NextApiHandler {
    return async (req, res) => {
      debug(`Handler for webhook ${this.name} called`);
      await processAsyncSaleorWebhook<TPayload>({
        req,
        apl: this.apl,
        allowedEvent: this.asyncEvent,
      })
        .then(async (context) => {
          debug("Incoming request validated. Call handlerFn");
          return handlerFn(req, res, context);
        })
        .catch(async (e) => {
          debug(`Unexpected error during processing the webhook ${this.name}`);

          if (e instanceof WebhookError) {
            debug(`Validation error: ${e.message}`);

            if (this.onError) {
              this.onError(e, req, res);
            }

            if (this.formatErrorResponse) {
              const { code, body } = await this.formatErrorResponse(e, req, res);

              res.status(code).send(body);

              return;
            }

            res.status(AsyncWebhookErrorCodeMap[e.errorType] || 400).send({
              error: {
                type: e.errorType,
                message: e.message,
              },
            });
            return;
          }
          debug("Unexpected error: %O", e);

          if (this.onError) {
            this.onError(e, req, res);
          }

          if (this.formatErrorResponse) {
            const { code, body } = await this.formatErrorResponse(e, req, res);

            res.status(code).send(body);

            return;
          }

          res.status(500).end();
        });
    };
  }
}
