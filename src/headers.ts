import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_DOMAIN_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION,
  SALEOR_SIGNATURE_HEADER,
} from "./const";

const toStringOrUndefined = (value: string | string[] | undefined) =>
  value ? value.toString() : undefined;

const toFloatOrNull = (value: string | string[] | undefined) =>
  value ? parseFloat(value.toString()) : null;

/**
 * Extracts Saleor-specific headers from the response.
 */
export const getSaleorHeaders = (headers: { [name: string]: string | string[] | undefined }) => ({
  domain: toStringOrUndefined(headers[SALEOR_DOMAIN_HEADER]),
  authorizationBearer: toStringOrUndefined(headers[SALEOR_AUTHORIZATION_BEARER_HEADER]),
  signature: toStringOrUndefined(headers[SALEOR_SIGNATURE_HEADER]),
  event: toStringOrUndefined(headers[SALEOR_EVENT_HEADER]),
  saleorApiUrl: toStringOrUndefined(headers[SALEOR_API_URL_HEADER]),
  schemaVersion: toFloatOrNull(headers[SALEOR_SCHEMA_VERSION]),
});

/**
 * Extracts the app's url from headers from the response.
 */
export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": xForwardedProto = "http" } = headers;

  const xForwardedProtos = Array.isArray(xForwardedProto)
    ? xForwardedProto.join(",")
    : xForwardedProto;
  const protocols = xForwardedProtos.split(",");
  // prefer https over other protocols
  const protocol = protocols.find((el) => el === "https") || protocols[0];

  return `${protocol}://${host}`;
};
