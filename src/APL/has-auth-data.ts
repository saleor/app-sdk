import { hasProp } from "../has-prop";

/**
 * Checks if given object has fields used by the AuthData
 */
export const hasAuthData = (data: unknown) =>
  hasProp(data, "domain") &&
  hasProp(data, "token") &&
  hasProp(data, "appId") &&
  hasProp(data, "apiUrl");
