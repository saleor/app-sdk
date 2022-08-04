import {
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_DOMAIN_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SIGNATURE_HEADER,
} from "./const";

export const getSaleorHeaders = (headers: { [name: string]: any }) => ({
  domain: headers[SALEOR_DOMAIN_HEADER],
  authorizationBearer: headers[SALEOR_AUTHORIZATION_BEARER_HEADER],
  signature: headers[SALEOR_SIGNATURE_HEADER],
  event: headers[SALEOR_EVENT_HEADER],
});
