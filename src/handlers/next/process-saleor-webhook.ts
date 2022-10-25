import { NextApiRequest } from "next";
import getRawBody from "raw-body";

import { APL } from "../../APL";
import { AuthData } from "../../APL/apl";
import { getSaleorHeaders } from "../../headers";
import { verifySignature } from "../../verify-signature";
import { getBaseURL } from "./get-base-url";

// TODO: Resolve shadow lint issue
// eslint-disable-next-line no-shadow
export enum SaleorWebhookError {
  MISSING_HOST_HEADER,
  MISSING_DOMAIN_HEADER,
  MISSING_EVENT_HEADER,
  MISSING_PAYLOAD_HEADER,
  MISSING_SIGNATURE_HEADER,
  MISSING_REQUEST_BODY,
  WRONG_EVENT,
  NOT_REGISTERED,
  SIGNATURE_VERIFICATION_FAILED,
  WRONG_METHOD,
}

export interface SaleorWebhookContext<T> {
  data?: { baseUrl: string; event: string; payload: T; authData: AuthData };
  error?: SaleorWebhookError;
}

interface ProcessSaleorWebhookArgs {
  req: NextApiRequest;
  apl: APL;
  allowedEvent: string;
}

type ProcessSaleorWebhook = <T = unknown>(
  props: ProcessSaleorWebhookArgs
) => Promise<SaleorWebhookContext<T>>;

export const processSaleorWebhook: ProcessSaleorWebhook = async <T>({
  req,
  apl,
  allowedEvent,
}: ProcessSaleorWebhookArgs) => {
  // try to validate thing which does not require additional API requests
  if (req.method !== "POST") {
    console.error("Wrong method");
    return { error: SaleorWebhookError.WRONG_METHOD };
  }
  const { event, domain, signature } = getSaleorHeaders(req.headers);
  const baseUrl = getBaseURL(req);

  if (!baseUrl) {
    console.error("No base URL");
    return { error: SaleorWebhookError.MISSING_HOST_HEADER };
  }

  if (!domain) {
    console.error("No saleor domain");
    return { error: SaleorWebhookError.MISSING_DOMAIN_HEADER };
  }

  if (!event) {
    console.error("Missing event header");
    return { error: SaleorWebhookError.MISSING_HOST_HEADER };
  }

  if (event !== allowedEvent) {
    console.error("Wrong event");
    return { error: SaleorWebhookError.WRONG_EVENT };
  }

  if (!signature) {
    console.error("No signature");
    return { error: SaleorWebhookError.MISSING_SIGNATURE_HEADER };
  }

  const rawBody = (
    await getRawBody(req, {
      length: req.headers["content-length"],
      limit: "1mb",
    })
  ).toString();
  if (!rawBody) {
    console.error("Missing request body");
    return { error: SaleorWebhookError.MISSING_REQUEST_BODY };
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    console.error("Request body cannot be parsed");
    return { error: SaleorWebhookError.MISSING_REQUEST_BODY };
  }

  // Check if domain is installed in the app
  const authData = await apl.get(domain);

  if (!authData) {
    console.error("No auth data found");
    return { error: SaleorWebhookError.NOT_REGISTERED };
  }

  // Payload signature check
  // TODO: Since it require additional request, can we cache it's response?
  const verificationError = await verifySignature(domain, signature, rawBody);
  if (verificationError) {
    console.debug(verificationError);
    return { error: SaleorWebhookError.SIGNATURE_VERIFICATION_FAILED };
  }

  return {
    data: {
      baseUrl,
      event,
      payload: parsedBody as T,
      authData,
    },
  };
};
