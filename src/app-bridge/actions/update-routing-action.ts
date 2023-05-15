import { ActionWithId, withActionId } from "./actions-utils";

/**
 * Ask Dashboard to update deep URL to preserve app route after refresh
 */
export const UPDATE_ROUTING_ACTION_TYPE = "updateRouting";

export type UpdateRoutingPayload = {
  newRoute: string;
};

export type UpdateRouting = ActionWithId<typeof UPDATE_ROUTING_ACTION_TYPE, UpdateRoutingPayload>;

export function createUpdateRoutingAction(payload: UpdateRoutingPayload): UpdateRouting {
  return withActionId({
    type: UPDATE_ROUTING_ACTION_TYPE,
    payload,
  });
}
