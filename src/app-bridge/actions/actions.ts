import { Values } from "../../helpers";
import {
  createNotificationAction,
  NOTIFICATION_ACTION_TYPE,
  NotificationAction,
} from "./notification-action";
import {
  createNotifyReadyAction,
  NOTIFY_READY_ACTION_TYPE,
  NotifyReady,
} from "./notify-ready-action";
import { createRedirectAction, REDIRECT_ACTION_TYPE, RedirectAction } from "./redirect-action";
import {
  createUpdateRoutingAction,
  UPDATE_ROUTING_ACTION_TYPE,
  UpdateRouting,
} from "./update-routing-action";

export const ActionType = {
  redirect: REDIRECT_ACTION_TYPE,
  notification: NOTIFICATION_ACTION_TYPE,
  updateRouting: UPDATE_ROUTING_ACTION_TYPE,
  notifyReady: NOTIFY_READY_ACTION_TYPE,
} as const;

export type ActionType = Values<typeof ActionType>;

export type Actions = RedirectAction | NotificationAction | UpdateRouting | NotifyReady;

export const Action = {
  Redirect: createRedirectAction,
  Notification: createNotificationAction,
  UpdateRouting: createUpdateRoutingAction,
  NotifyReady: createNotifyReadyAction,
};

// Backwards compatibility
export const actions = Action;
