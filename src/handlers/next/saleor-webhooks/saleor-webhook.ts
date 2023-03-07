import { ASTNode } from "graphql";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { APL } from "../../../APL";
import { createDebug } from "../../../debug";
import { gqlAstToString } from "../../../gql-ast-to-string";
import { AsyncWebhookEventType, SyncWebhookEventType, WebhookManifest } from "../../../types";
import {
  processSaleorWebhook,
  SaleorWebhookError,
  WebhookContext,
  WebhookError,
} from "./process-saleor-webhook";

const debug = createDebug("SaleorWebhook");

export interface WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> {
  name?: string;
  webhookPath: string;
  event: Event;
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
  query: string | ASTNode;
  /**
   * @deprecated will be removed in 0.35.0, use query field instead
   */
  subscriptionQueryAst?: ASTNode;
}

export const WebhookErrorCodeMap: Record<SaleorWebhookError, number> = {
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

export type NextWebhookApiHandler<TPayload = unknown, TExtras = {}> = (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: WebhookContext<TPayload> & TExtras
) => unknown | Promise<unknown>;

export abstract class SaleorWebhook<
  TPayload = unknown,
  TExtras extends Record<string, unknown> = {}
> {
  protected abstract eventType: "async" | "sync";

  protected extraContext?: TExtras;

  name: string;

  webhookPath: string;

  query: string | ASTNode;

  event: AsyncWebhookEventType | SyncWebhookEventType;

  isActive?: boolean;

  apl: APL;

  onError: WebhookConfig["onError"];

  formatErrorResponse: WebhookConfig["formatErrorResponse"];

  protected constructor(configuration: WebhookConfig) {
    const {
      name,
      webhookPath,
      event,
      query,
      apl,
      isActive = true,
      subscriptionQueryAst,
    } = configuration;

    this.name = name || `${event} webhook`;
    /**
     * Fallback subscriptionQueryAst to avoid breaking changes
     *
     * TODO Remove in 0.35.0
     */
    this.query = query ?? subscriptionQueryAst;
    this.webhookPath = webhookPath;
    this.event = event;
    this.isActive = isActive;
    this.apl = apl;
    this.onError = configuration.onError;
    this.formatErrorResponse = configuration.formatErrorResponse;
  }

  private getTargetUrl(baseUrl: string) {
    return new URL(this.webhookPath, baseUrl).href;
  }

  /**
   * Returns synchronous event manifest for this webhook.
   *
   * @param baseUrl Base URL used by your application
   * @returns WebhookManifest
   */
  getWebhookManifest(baseUrl: string): WebhookManifest {
    const manifestBase: Omit<WebhookManifest, "asyncEvents" | "syncEvents"> = {
      query: typeof this.query === "string" ? this.query : gqlAstToString(this.query),
      name: this.name,
      targetUrl: this.getTargetUrl(baseUrl),
      isActive: this.isActive,
    };

    switch (this.eventType) {
      case "async":
        return {
          ...manifestBase,
          asyncEvents: [this.event as AsyncWebhookEventType],
        };
      case "sync":
        return {
          ...manifestBase,
          syncEvents: [this.event as SyncWebhookEventType],
        };
      default: {
        throw new Error("Class extended incorrectly");
      }
    }
  }

  /**
   * Wraps provided function, to ensure incoming request comes from registered Saleor instance.
   * Also provides additional `context` object containing typed payload and request properties.
   */
  createHandler(handlerFn: NextWebhookApiHandler<TPayload, TExtras>): NextApiHandler {
    return async (req, res) => {
      debug(`Handler for webhook ${this.name} called`);

      await processSaleorWebhook<TPayload>({
        req,
        apl: this.apl,
        allowedEvent: this.event,
      })
        .then(async (context) => {
          debug("Incoming request validated. Call handlerFn");

          return handlerFn(req, res, { ...(this.extraContext ?? ({} as TExtras)), ...context });
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

            res.status(WebhookErrorCodeMap[e.errorType] || 400).send({
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
