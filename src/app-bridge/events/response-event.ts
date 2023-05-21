import { DashboardEvent } from "./events-utils";

export const DISPATCH_RESPONSE_EVENT_TYPE = "response";

export type DispatchResponseEvent = DashboardEvent<
  typeof DISPATCH_RESPONSE_EVENT_TYPE,
  {
    actionId: string;
    ok: boolean;
  }
>;

export function createDispatchResponseEvent(actionId: string, ok: boolean): DispatchResponseEvent {
  return {
    type: DISPATCH_RESPONSE_EVENT_TYPE,
    payload: {
      actionId,
      ok,
    },
  };
}
