import { ASTNode } from "graphql";

import { APL } from "@/APL";
import { createDebug } from "@/debug";
import { gqlAstToString } from "@/gql-ast-to-string";
import { WebhookContext, WebhookError, WebhookErrorCodeMap } from "@/handlers/shared/saleor-webhook";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { AsyncWebhookEventType, SyncWebhookEventType, WebhookManifest } from "@/types";

import { PlatformAdapterMiddleware } from "./adapter-middleware";
import { PlatformAdapterInterface } from "./generic-adapter-use-case-types";

const debug = createDebug("SaleorWebhook");

export interface GenericWebhookConfig<
  RequestType,
  Event = AsyncWebhookEventType | SyncWebhookEventType
> {
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

export abstract class GenericSaleorWebhook<
  TRequestType,
  TPayload = unknown,
  TExtras extends Record<string, unknown> = {}
> {
  private webhookValidator = new SaleorWebhookValidator();

  protected abstract eventType: "async" | "sync";

  protected extraContext?: TExtras;

  name: string;

  webhookPath: string;

  query: string | ASTNode;

  event: AsyncWebhookEventType | SyncWebhookEventType;

  isActive?: boolean;

  apl: APL;

  onError: GenericWebhookConfig<TRequestType>["onError"];

  formatErrorResponse: GenericWebhookConfig<TRequestType>["formatErrorResponse"];

  protected constructor(configuration: GenericWebhookConfig<TRequestType>) {
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

  protected async prepareRequest<Adapter extends PlatformAdapterInterface<TRequestType>>(
    adapter: Adapter
  ): Promise<
    | { result: "callHandler"; context: WebhookContext<TPayload> }
    | { result: "sendResponse"; response: ReturnType<Adapter["send"]> }
  > {
    const adapterMiddleware = new PlatformAdapterMiddleware<TRequestType>(adapter);
    const validationResult = await this.webhookValidator.validateRequest<TPayload, TRequestType>({
      allowedEvent: this.event,
      apl: this.apl,
      adapter,
      adapterMiddleware,
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
          }) as ReturnType<Adapter["send"]>,
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
        }) as ReturnType<Adapter["send"]>,
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
        }) as ReturnType<Adapter["send"]>,
      };
    }

    return {
      result: "sendResponse",
      response: adapter.send({
        status: 500,
        body: "Unexpected error while handling request",
        bodyType: "string",
      }) as ReturnType<Adapter["send"]>,
    };
  }

  abstract createHandler(handlerFn: unknown): unknown;
}
