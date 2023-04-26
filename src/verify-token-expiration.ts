import { createDebug } from "./debug";
import { DashboardTokenPayload } from "./verify-jwt";

const debug = createDebug("verify-token-expiration");

export const verifyTokenExpiration = (token: DashboardTokenPayload) => {
  const tokenExpiration = token.exp;
  const now = new Date();
  const nowTimestamp = now.valueOf();

  if (!tokenExpiration) {
    throw new Error("Missing \"exp\" field in token");
  }

  /**
   * Timestamp in token are in seconds, but timestamp from Date is in miliseconds
   */
  const tokenMsTimestamp = tokenExpiration * 1000;

  debug(
    "Comparing todays date: %s and token expiration date: %s",
    now.toLocaleString(),
    new Date(tokenMsTimestamp).toLocaleString()
  );

  if (tokenMsTimestamp <= nowTimestamp) {
    throw new Error("Token is expired");
  }
};
