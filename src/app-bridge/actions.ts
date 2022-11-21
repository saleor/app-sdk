import { v4 as uuidv4 } from "uuid";

import { Values } from "./helpers";

// Using constants over Enums, more info: https://fettblog.eu/tidy-typescript-avoid-enums/
export const ActionType = {
  redirect: "redirect",
  notification: "notification",
  updateRouting: "updateRouting",
} as const;

export type ActionType = Values<typeof ActionType>;

type Action<Name extends ActionType, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

type ActionWithId<Name extends ActionType, Payload extends {}> = {
  payload: Payload & { actionId: string };
  type: Name;
};

function withActionId<Name extends ActionType, Payload extends {}, T extends Action<Name, Payload>>(
  action: T
): ActionWithId<Name, Payload> {
  const actionId = uuidv4();

  return {
    ...action,
    payload: {
      ...action.payload,
      actionId,
    },
  };
}

export type RedirectPayload = {
  /**
   * Relative (inside Dashboard) or absolute URL path.
   */
  to: string;
  newContext?: boolean;
};
/**
 * Redirects Dashboard user.
 */
export type RedirectAction = ActionWithId<"redirect", RedirectPayload>;

function createRedirectAction(payload: RedirectPayload): RedirectAction {
  return withActionId({
    payload,
    type: "redirect",
  });
}

export type NotificationPayload = {
  /**
   * Matching Dashboard's notification object.
   */
  status?: "info" | "success" | "warning" | "error";
  title?: string;
  text?: string;
  apiMessage?: string;
};

export type NotificationAction = ActionWithId<"notification", NotificationPayload>;
/**
 * Shows a notification using Dashboard's notification system.
 */
function createNotificationAction(payload: NotificationPayload): NotificationAction {
  return withActionId({
    type: "notification",
    payload,
  });
}

export type UpdateRoutingPayload = {
  newRoute: string;
  strategy: "replace" | "push";
};

export type UpdateRouting = ActionWithId<"updateRouting", UpdateRoutingPayload>;

function createUpdateRoutingAction(payload: UpdateRoutingPayload): UpdateRouting {
  return withActionId({
    type: "updateRouting",
    payload,
  });
}

export type Actions = RedirectAction | NotificationAction | UpdateRouting;

export const actions = {
  Redirect: createRedirectAction,
  Notification: createNotificationAction,
  UpdateRouting: createUpdateRoutingAction,
};
