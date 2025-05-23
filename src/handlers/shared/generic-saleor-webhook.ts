import { ASTNode } from "graphql";

import { APL } from "@/APL";
import { verifySignatureWithJwks } from "@/auth";
import { createDebug } from "@/debug";
import { gqlAstToString } from "@/gql-ast-to-string";
import {
  FormatWebhookErrorResult,
  WebhookContext,
  WebhookError,
  WebhookErrorCodeMap,
} from "@/handlers/shared/saleor-webhook";
import { SaleorWebhookValidator } from "@/handlers/shared/saleor-webhook-validator";
import { AsyncWebhookEventType, SyncWebhookEventType, WebhookManifest } from "@/types";

import { PlatformAdapterInterface } from "./generic-adapter-use-case-types";
import { SaleorRequestProcessor } from "./saleor-request-processor";

const debug = createDebug("SaleorWebhook");

export interface GenericWebhookConfig<
  RequestType,
  Event = AsyncWebhookEventType | SyncWebhookEventType,
> {
  name?: string;
  webhookPath: string;
  event: Event;
  isActive?: boolean;
  apl: APL;
  onError?(error: WebhookError | Error, request: RequestType): void;
  formatErrorResponse?(
    error: WebhookError | Error,
    request: RequestType,
  ): Promise<FormatWebhookErrorResult>;
  query: string | ASTNode;
  /**
   * Allows to overwrite the default signature verification function.
   *
   * This is useful for testing purposes, when you want to fabricate a payload, or to opt-out from the default behavior from the library
   */
  verifySignatureFn?: typeof verifySignatureWithJwks;
}

export abstract class GenericSaleorWebhook<TRequestType, TPayload = unknown> {
  protected abstract eventType: "async" | "sync";

  name: string;

  webhookPath: string;

  query: string | ASTNode;

  event: AsyncWebhookEventType | SyncWebhookEventType;

  isActive?: boolean;

  apl: APL;

  onError: GenericWebhookConfig<TRequestType>["onError"];

  formatErrorResponse: GenericWebhookConfig<TRequestType>["formatErrorResponse"];

  verifySignatureFn: typeof verifySignatureWithJwks;

  private webhookValidator: SaleorWebhookValidator;

  protected constructor(configuration: GenericWebhookConfig<TRequestType>) {
    const { name, webhookPath, event, query, apl, isActive = true } = configuration;

    this.name = name || `${event} webhook`;
    this.query = query;
    this.webhookPath = webhookPath;
    this.event = event;
    this.isActive = isActive;
    this.apl = apl;
    this.onError = configuration.onError;
    this.formatErrorResponse = configuration.formatErrorResponse;
    this.verifySignatureFn = configuration.verifySignatureFn ?? verifySignatureWithJwks;

    this.webhookValidator = new SaleorWebhookValidator({
      verifySignatureFn: this.verifySignatureFn,
    });
  }

  /** Gets webhook absolute URL based on baseUrl of app
   * baseUrl is passed usually from manifest
   * baseUrl can include it's own pathname (e.g. http://aws-lambda.com/prod -> has /prod pathname)
   * that should be included in full webhook URL, e.g. http://my-webhook.com/prod/api/webhook/order-created */
  private getTargetUrl(baseUrl: string) {
    const parsedBaseUrl = new URL(baseUrl);

    // Remove slash `/` at the beginning of webhook path
    const normalizedWebhookPath = this.webhookPath.replace(/^\//, "");

    /** Note: URL removes path from `baseUrl`, so we must add it to webhookPath
     * URL.pathname = http://my-fn.com/path -> /path
     * Replace double slashes // -> / (either from webhook path or baseUrl) */
    const fullPath = `${parsedBaseUrl.pathname}/${normalizedWebhookPath}`.replace("//", "/");
    return new URL(fullPath, baseUrl).href;
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
    adapter: Adapter,
  ): Promise<
    | { result: "callHandler"; context: WebhookContext<TPayload> }
    | { result: "sendResponse"; response: ReturnType<Adapter["send"]> }
  > {
    const requestProcessor = new SaleorRequestProcessor<TRequestType>(adapter);
    const validationResult = await this.webhookValidator.validateRequest<TPayload, TRequestType>({
      allowedEvent: this.event,
      apl: this.apl,
      adapter,
      requestProcessor,
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
