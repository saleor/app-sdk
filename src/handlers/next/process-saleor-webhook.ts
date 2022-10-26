import { NextApiRequest } from "next";
import getRawBody from "raw-body";

import { APL } from "../../APL";
import { AuthData } from "../../APL/apl";
import { getSaleorHeaders } from "../../headers";
import { verifySignature } from "../../verify-signature";
import { getBaseURL } from "./get-base-url";

// TODO: Resolve shadow lint issue
// eslint-disable-next-line no-shadow
export type SaleorWebhookError =
  | "OTHER"
  | "MISSING_HOST_HEADER"
  | "MISSING_DOMAIN_HEADER"
  | "MISSING_EVENT_HEADER"
  | "MISSING_PAYLOAD_HEADER"
  | "MISSING_SIGNATURE_HEADER"
  | "MISSING_REQUEST_BODY"
  | "WRONG_EVENT"
  | "NOT_REGISTERED"
  | "SIGNATURE_VERIFICATION_FAILED"
  | "WRONG_METHOD"
  | "CANT_BE_PARSED";

export class WebhookError extends Error {
  httpResponseCode = 400;

  errorCode: SaleorWebhookError = "OTHER";

  constructor(message: string, httpResponseCode?: number, errorCode?: SaleorWebhookError) {
    super(message);
    if (httpResponseCode) {
      this.httpResponseCode = httpResponseCode;
    }
    if (errorCode) {
      this.errorCode = errorCode;
    }
    Object.setPrototypeOf(this, WebhookError.prototype);
  }
}

export type WebhookContext<T> = {
  baseUrl: string;
  event: string;
  payload: T;
  authData: AuthData;
};

interface ProcessSaleorWebhookArgs {
  req: NextApiRequest;
  apl: APL;
  allowedEvent: string;
}

type ProcessSaleorWebhook = <T = unknown>(
  props: ProcessSaleorWebhookArgs
) => Promise<WebhookContext<T>>;

export const processSaleorWebhook: ProcessSaleorWebhook = async <T>({
  req,
  apl,
  allowedEvent,
}: ProcessSaleorWebhookArgs): Promise<WebhookContext<T>> => {
  // try to validate thing which does not require additional API requests
  if (req.method !== "POST") {
    console.error("Wrong method");
    throw new WebhookError("Wrong request method", 405, "WRONG_METHOD");
  }
  const { event, domain, signature } = getSaleorHeaders(req.headers);
  const baseUrl = getBaseURL(req);

  if (!baseUrl) {
    console.error("Missing host header");
    throw new WebhookError("Missing host header", 400, "MISSING_HOST_HEADER");
  }

  if (!domain) {
    console.error("No saleor domain");
    throw new WebhookError("Missing saleor-domain header", 400, "MISSING_DOMAIN_HEADER");
  }

  if (!event) {
    console.error("Missing event header");
    throw new WebhookError("Missing saleor-event header", 400, "MISSING_EVENT_HEADER");
  }

  const expected = allowedEvent.toLowerCase();
  if (event !== expected) {
    console.error(`Wrong incoming request event: ${event}. Expected: ${expected}`);
    throw new WebhookError(
      `Wrong incoming request event: ${event}. Expected: ${expected}`,
      400,
      "WRONG_EVENT"
    );
  }

  if (!signature) {
    console.error("No signature");
    throw new WebhookError("Missing saleor-event header", 400, "MISSING_SIGNATURE_HEADER");
  }

  const rawBody = (
    await getRawBody(req, {
      length: req.headers["content-length"],
      limit: "1mb",
    })
  ).toString();
  if (!rawBody) {
    console.error("Missing request body");
    throw new WebhookError("Missing request body", 400, "MISSING_REQUEST_BODY");
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    console.error("Request body cannot be parsed");
    throw new WebhookError("Request body cant be parsed", 400, "CANT_BE_PARSED");
  }

  // Check if domain is installed in the app
  const authData = await apl.get(domain);

  if (!authData) {
    console.error("No auth data found");
    throw new WebhookError(
      `Can't find auth data for domain ${domain}. Please register the application`,
      401,
      "NOT_REGISTERED"
    );
  }

  // Payload signature check
  // TODO: Since it require additional request, can we cache it's response?
  const verificationError = await verifySignature(domain, signature, rawBody);
  if (verificationError) {
    console.debug(verificationError);
    throw new WebhookError("Request signature check failed", 401, "SIGNATURE_VERIFICATION_FAILED");
  }

  return {
    baseUrl,
    event,
    payload: parsedBody as T,
    authData,
  };
};
