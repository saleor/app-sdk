import { AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";
import { authDataFromObject } from "./auth-data-from-object";

const debug = createAPLDebug("authDataFromString");

/**
 * Parse given string and returns valid AuthData object if valid
 */
export const authDataFromString = (stringifiedData: string): AuthData | undefined => {
  let parsed;
  try {
    parsed = JSON.parse(stringifiedData);
  } catch {
    debug("Could not parse given data");
    return undefined;
  }
  return authDataFromObject(parsed);
};
