import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_DOMAIN_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SIGNATURE_HEADER,
} from "./const";

const toStringOrUndefined = (value: string | string[] | undefined) =>
  value ? value.toString() : undefined;

export const getSaleorHeaders = (headers: { [name: string]: string | string[] | undefined }) => ({
  domain: toStringOrUndefined(headers[SALEOR_DOMAIN_HEADER]),
  authorizationBearer: toStringOrUndefined(headers[SALEOR_AUTHORIZATION_BEARER_HEADER]),
  signature: toStringOrUndefined(headers[SALEOR_SIGNATURE_HEADER]),
  event: toStringOrUndefined(headers[SALEOR_EVENT_HEADER]),
  saleorApiUrl: toStringOrUndefined(headers[SALEOR_API_URL_HEADER]),
});

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;
  return `${protocol}://${host}`;
};
