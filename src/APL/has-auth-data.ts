import { hasProp } from "../has-prop";

/**
 * Checks if given object has fields used by the AuthData
 */
export const hasAuthData = (data: unknown) =>
  hasProp(data, "domain") &&
  data.domain &&
  hasProp(data, "token") &&
  data.token &&
  hasProp(data, "appId") &&
  data.appId &&
  hasProp(data, "saleorApiUrl") &&
  data.saleorApiUrl;
