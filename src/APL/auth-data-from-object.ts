import { AuthData } from "./apl";
import { hasAuthData } from "./has-auth-data";

/**
 * Returns AuthData if the object follows it's structure
 */
export const authDataFromObject = (parsed: unknown): AuthData | undefined => {
  if (!hasAuthData(parsed)) {
    console.debug("Given object did not contained AuthData");
    return undefined;
  }
  const { apiUrl, appId, domain, token, jwks } = parsed as AuthData;
  return {
    apiUrl,
    appId,
    domain,
    token,
    jwks,
  };
};
