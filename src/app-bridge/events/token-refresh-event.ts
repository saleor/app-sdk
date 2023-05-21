import { DashboardEvent } from "./events-utils";

export const TOKEN_REFRESH_EVENT_TYPE = "tokenRefresh";

export type TokenRefreshEvent = DashboardEvent<
  typeof TOKEN_REFRESH_EVENT_TYPE,
  {
    token: string;
  }
>;

export function createTokenRefreshEvent(token: string): TokenRefreshEvent {
  return {
    type: TOKEN_REFRESH_EVENT_TYPE,
    payload: {
      token,
    },
  };
}
