/**
 * TODO: Validate proper URL
 */
const resolveUrlProtocol = (saleorDomain: string): string =>
  saleorDomain === "localhost:8000" ? "http" : "https";

/**
 * @deprecated use getJwksUrlFromSaleorApiUrl
 */
export const getJwksUrl = (saleorDomain: string): string =>
  `${resolveUrlProtocol(saleorDomain)}://${saleorDomain}/.well-known/jwks.json`;

export const getJwksUrlFromSaleorApiUrl = (saleorApiUrl: string): string =>
  `${new URL(saleorApiUrl).origin}/.well-known/jwks.json`;

/**
 * @deprecated Use saleor-api-url header
 */
export const getGraphQLUrl = (saleorDomain: string): string =>
  `${resolveUrlProtocol(saleorDomain)}://${saleorDomain}/graphql/`;

/**
 * @deprecated Remove in v1, left for compatibility
 */
export const jwksUrl = getJwksUrl;

/**
 * @deprecated Remove in v1, left for compatibility
 */
export const graphQLUrl = getGraphQLUrl;
