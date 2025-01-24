import { AuthData } from "../../APL";

export type SaleorWebhookError =
  | "OTHER"
  | "MISSING_HOST_HEADER"
  | "MISSING_DOMAIN_HEADER"
  | "MISSING_API_URL_HEADER"
  | "MISSING_EVENT_HEADER"
  | "MISSING_PAYLOAD_HEADER"
  | "MISSING_SIGNATURE_HEADER"
  | "MISSING_REQUEST_BODY"
  | "WRONG_EVENT"
  | "NOT_REGISTERED"
  | "SIGNATURE_VERIFICATION_FAILED"
  | "WRONG_METHOD"
  | "CANT_BE_PARSED"
  | "CONFIGURATION_ERROR";

export class WebhookError extends Error {
  errorType: SaleorWebhookError = "OTHER";

  constructor(message: string, errorType: SaleorWebhookError) {
    super(message);
    if (errorType) {
      this.errorType = errorType;
    }
    Object.setPrototypeOf(this, WebhookError.prototype);
  }
}

export type WebhookContext<TPayload> = {
  baseUrl: string;
  event: string;
  payload: TPayload;
  authData: AuthData;
  /** For Saleor < 3.15 it will be null. */
  schemaVersion: number | null;
};
