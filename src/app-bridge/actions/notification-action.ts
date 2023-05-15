import { ActionWithId, withActionId } from "./actions-utils";

/**
 * Ask Dashboard to send a notification toast
 */
export const NOTIFICATION_ACTION_TYPE = "notification";

export type NotificationPayload = {
  /**
   * Matching Dashboard's notification object.
   */
  status?: "info" | "success" | "warning" | "error";
  title?: string;
  text?: string;
  apiMessage?: string;
};

export type NotificationAction = ActionWithId<typeof NOTIFICATION_ACTION_TYPE, NotificationPayload>;

/**
 * Shows a notification using Dashboard's notification system.
 */
export function createNotificationAction(payload: NotificationPayload): NotificationAction {
  return withActionId({
    type: NOTIFICATION_ACTION_TYPE,
    payload,
  });
}
