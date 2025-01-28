import { AuthData } from "../../APL";

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
  // TODO: Make this required
  /** Added in Saleor 3.15 */
  schemaVersion: number | null;
};
