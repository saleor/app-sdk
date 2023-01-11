import { AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";
import { hasAuthData } from "./has-auth-data";

const debug = createAPLDebug("authDataFromObject");

/**
 * Returns AuthData if the object follows it's structure
 */
export const authDataFromObject = (parsed: unknown): AuthData | undefined => {
  if (!hasAuthData(parsed)) {
    debug("Given object did not contained AuthData");
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
