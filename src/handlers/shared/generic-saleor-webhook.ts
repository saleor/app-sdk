import { ASTNode } from "graphql";

import { APL } from "@/APL";
import { createDebug } from "@/debug";
import { gqlAstToString } from "@/gql-ast-to-string";
import { PlatformAdapterInterface } from "@/handlers/shared";
import { WebhookContext, WebhookError } from "@/handlers/shared/process-saleor-webhook";
import { WebhookErrorCodeMap } from "@/handlers/shared/saleor-webhook";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { AsyncWebhookEventType, SyncWebhookEventType, WebhookManifest } from "@/types";

const debug = createDebug("SaleorWebhook");

export interface WebhookConfig<RequestType, Event = AsyncWebhookEventType | SyncWebhookEventType> {
  name?: string;
  webhookPath: string;
  event: Event;
  isActive?: boolean;
  apl: APL;
  onError?(error: WebhookError | Error, request: RequestType): void;
  formatErrorResponse?(
    error: WebhookError | Error,
    request: RequestType
  ): Promise<{
    code: number;
    body: string;
  }>;
  query: string | ASTNode;
  /**
   * @deprecated will be removed in 0.35.0, use query field instead
   */
  subscriptionQueryAst?: ASTNode;
}

export abstract class GenericSaleorWebApiWebhook<
  RequestType,
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

  onError: WebhookConfig<RequestType>["onError"];

  formatErrorResponse: WebhookConfig<RequestType>["formatErrorResponse"];

  protected constructor(configuration: WebhookConfig<RequestType>) {
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

  protected async prepareRequest<A extends PlatformAdapterInterface<RequestType>>({
    adapter,
    validator,
  }: {
    adapter: A;
    validator: SaleorWebhookValidator<TPayload>;
    callback: (adapter: A, context: WebhookContext<TPayload>) => unknown;
  }): Promise<
    | { result: "callHandler"; context: WebhookContext<TPayload> }
    | { result: "sendResponse"; response: unknown }
  > {
    const validationResult = await validator.validateRequest<TPayload>({
      allowedEvent: this.event,
      apl: this.apl,
    });

    if (validationResult.result === "ok") {
      return { result: "callHandler", context: validationResult.context };
    }

    const { error } = validationResult;

    debug(`Unexpected error during processing the webhook ${this.name}`);

    if (error instanceof WebhookError) {
      debug(`Validation error: ${error.message}`);

      if (this.onError) {
        this.onError(error, adapter.request);
      }

      if (this.formatErrorResponse) {
        const { code, body } = await this.formatErrorResponse(error, adapter.request);

        return {
          result: "sendResponse",
          response: adapter.send({
            status: code,
            body,
            bodyType: "string",
          }),
        };
      }

      return {
        result: "sendResponse",
        response: adapter.send({
          bodyType: "json",
          body: {
            error: {
              type: error.errorType,
              message: error.message,
            },
          },
          status: WebhookErrorCodeMap[error.errorType] || 400,
        }),
      };
    }
    debug("Unexpected error: %O", error);

    if (this.onError) {
      this.onError(error, adapter.request);
    }

    if (this.formatErrorResponse) {
      const { code, body } = await this.formatErrorResponse(error, adapter.request);

      return {
        result: "sendResponse",
        response: adapter.send({
          status: code,
          body,
          bodyType: "string",
        }),
      };
    }

    return {
      result: "sendResponse",
      response: adapter.send({
        status: 500,
        body: "Unexpected error while handling request",
        bodyType: "string",
      }),
    };
  }
}
