export const getJwksUrlFromSaleorApiUrl = (saleorApiUrl: string): string =>
  `${new URL(saleorApiUrl).origin}/.well-known/jwks.json`;
