import { DashboardEvent } from "./events-utils";

export const REDIRECT_EVENT_TYPE = "redirect";

// todo is it used?
export type RedirectEvent = DashboardEvent<
  typeof REDIRECT_EVENT_TYPE,
  {
    path: string;
  }
>;

export function createRedirectEvent(path: string): RedirectEvent {
  return {
    type: REDIRECT_EVENT_TYPE,
    payload: {
      path,
    },
  };
}
