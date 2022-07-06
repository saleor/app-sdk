const urlProtocol = (saleorDomain: string): string =>
  saleorDomain === "localhost:8000" ? "http" : "https";

export const jwksUrl = (saleorDomain: string): string =>
  `${urlProtocol(saleorDomain)}://${saleorDomain}/.well-known/jwks.json`;

export const graphQLUrl = (saleorDomain: string): string =>
  `${urlProtocol(saleorDomain)}://${saleorDomain}/graphql/`;
