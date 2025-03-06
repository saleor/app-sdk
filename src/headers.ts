export const SALEOR_EVENT_HEADER = "saleor-event";
export const SALEOR_SIGNATURE_HEADER = "saleor-signature";
export const SALEOR_AUTHORIZATION_BEARER_HEADER = "authorization-bearer";
export const SALEOR_API_URL_HEADER = "saleor-api-url";
/**
 * Available when Saleor executes "manifest" or "token exchange" requests.
 */
export const SALEOR_SCHEMA_VERSION_HEADER = "saleor-schema-version";

const toStringOrUndefined = (value: string | string[] | undefined) =>
  value ? value.toString() : undefined;

/**
 * Extracts Saleor-specific headers from the response.
 */
export const getSaleorHeaders = (headers: { [name: string]: string | string[] | undefined }) => ({
  authorizationBearer: toStringOrUndefined(headers[SALEOR_AUTHORIZATION_BEARER_HEADER]),
  signature: toStringOrUndefined(headers[SALEOR_SIGNATURE_HEADER]),
  event: toStringOrUndefined(headers[SALEOR_EVENT_HEADER]),
  saleorApiUrl: toStringOrUndefined(headers[SALEOR_API_URL_HEADER]),
  schemaVersion: toStringOrUndefined(headers[SALEOR_SCHEMA_VERSION_HEADER]),
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
