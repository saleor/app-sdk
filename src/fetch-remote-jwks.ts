import { getJwksUrlFromSaleorApiUrl } from "./urls";

export const fetchRemoteJwks = async (saleorApiUrl: string) => {
  const jwksResponse = await fetch(getJwksUrlFromSaleorApiUrl(saleorApiUrl));
  return jwksResponse.text();
};
