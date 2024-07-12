import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_DOMAIN_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION,
  SALEOR_SIGNATURE_HEADER,
} from "./const";
import { IncomingHttpHeaders } from "node:http";

const toStringOrUndefined = (value: string | string[] | undefined | null) =>
  value ? value.toString() : undefined;

const toFloatOrNull = (value: string | string[] | undefined | null) =>
  value ? parseFloat(value.toString()) : null;

/**
 * Extracts Saleor-specific headers from the response.
 */
export const getSaleorHeaders = (headers: IncomingHttpHeaders | Headers) => {
  if (headers instanceof Headers) {
    const parsedHeaders = new Headers(headers);

    return {
      domain: toStringOrUndefined(parsedHeaders.get(SALEOR_DOMAIN_HEADER)),
      authorizationBearer: toStringOrUndefined(
        parsedHeaders.get(SALEOR_AUTHORIZATION_BEARER_HEADER)
      ),
      signature: toStringOrUndefined(parsedHeaders.get(SALEOR_SIGNATURE_HEADER)),
      event: toStringOrUndefined(parsedHeaders.get(SALEOR_EVENT_HEADER)),
      saleorApiUrl: toStringOrUndefined(parsedHeaders.get(SALEOR_API_URL_HEADER)),
      schemaVersion: toFloatOrNull(parsedHeaders.get(SALEOR_SCHEMA_VERSION)),
    };
  } else {
    return {
      domain: toStringOrUndefined(headers[SALEOR_DOMAIN_HEADER]),
      authorizationBearer: toStringOrUndefined(headers[SALEOR_AUTHORIZATION_BEARER_HEADER]),
      signature: toStringOrUndefined(headers[SALEOR_SIGNATURE_HEADER]),
      event: toStringOrUndefined(headers[SALEOR_EVENT_HEADER]),
      saleorApiUrl: toStringOrUndefined(headers[SALEOR_API_URL_HEADER]),
      schemaVersion: toFloatOrNull(headers[SALEOR_SCHEMA_VERSION]),
    };
  }
};

/**
 * Extracts the app's url from headers from the response.
 */
export const getBaseUrl = (
  headers: Headers | IncomingHttpHeaders
): string => {
  let host = "";
  let xForwardedProto: string | string[] = "http";

  if (headers instanceof Headers) {
    host = headers.get("host") as string;
    xForwardedProto = headers.get("x-forwarded-proto") ?? xForwardedProto;
  } else {
    host = headers.host as string;
    xForwardedProto = headers["x-forwarded-proto"] ?? xForwardedProto;
  }

  const xForwardedProtos = Array.isArray(xForwardedProto)
    ? xForwardedProto.join(",")
    : xForwardedProto;
  const protocols = xForwardedProtos.split(",");
  // prefer https over other protocols
  const protocol = protocols.find((el) => el === "https") || protocols[0];

  return `${protocol}://${host}`;
};
