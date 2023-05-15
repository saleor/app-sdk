import { ActionWithId, withActionId } from "./actions-utils";

/**
 * Inform Dashboard that AppBridge is ready. Triggered automatically by the app, but can be disabled to postpone it
 */
export const NOTIFY_READY_ACTION_TYPE = "notifyReady";

export type NotifyReady = ActionWithId<typeof NOTIFY_READY_ACTION_TYPE, {}>;

export function createNotifyReadyAction(): NotifyReady {
  return withActionId({
    type: NOTIFY_READY_ACTION_TYPE,
    payload: {},
  });
}
