import {
  AllFormPayloadUpdatePayloads,
  formPayloadUpdateActionName,
} from "@/app-bridge/form-payload";

import { AppPermission } from "../types";
import { Values } from "./helpers";
import { OpenPopupParams } from "./open-popup-params";

// Using constants over Enums, more info: https://fettblog.eu/tidy-typescript-avoid-enums/
export const ActionType = {
  /**
   * Ask Dashboard to redirect - either internal or external route
   */
  redirect: "redirect",
  /**
   * Ask Dashboard to send a notification toast
   */
  notification: "notification",
  /**
   * Ask Dashboard to update deep URL to preserve app route after refresh
   */
  updateRouting: "updateRouting",
  /**
   * Inform Dashboard that AppBridge is ready
   */
  notifyReady: "notifyReady",
  /**
   * Request one or more permissions from the Dashboard
   *
   * Available from 3.15
   */
  requestPermission: "requestPermissions",
  /**
   * Apply form fields in active context.
   *
   * EXPERIMENTAL
   */
  formPayloadUpdate: formPayloadUpdateActionName,
  /**
   * Ask Dashboard to close the popup (if the app is running in a popup).
   * If not in a popup, it does nothing and responds ok: true.
   */
  popupClose: "popupClose",
  /**
   * Report the app's content height so the Dashboard can resize the widget iframe.
   *
   * Only affects `*_DETAILS_WIDGETS` extensions. Available from 3.23.7.
   */
  widgetResize: "widgetResize",
  /**
   * Ask Dashboard to refresh the entity active in the current context,
   * e.g. the currently open Order or Product.
   */
  refreshEntity: "refreshEntity",
  /**
   * Ask Dashboard to open one of the same app's POPUP extensions ("full mode"),
   * referenced by its app-defined `identifier`. Intended to be dispatched from a
   * WIDGET extension to open a co-located POPUP extension of the same app.
   */
  openPopup: "openPopup",
  /**
   * Ask Dashboard to run a shortcut it previously advertised via
   * `shortcutsChanged`. AppBridge dispatches this automatically when the user
   * presses a registered chord inside the iframe.
   *
   * Only has an effect on Dashboard versions that handle the `triggerShortcut`
   * action type and send `shortcutsChanged`.
   */
  triggerShortcut: "triggerShortcut",
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
  action: T,
): ActionWithId<Name, Payload> {
  try {
    const actionId = globalThis.crypto.randomUUID();

    return {
      ...action,
      payload: {
        ...action.payload,
        actionId,
      },
    };
  } catch (e) {
    throw new Error(
      "Failed to generate action ID, likely as your browser doesn't consider current session as Secure Context. Please ensure you are using https or localhost, or current IP/domain is in 'dom.securecontext.allowlist'/'#unsafely-treat-insecure-origin-as-secure' if you trust it.",
    );
  }
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
};

export type UpdateRouting = ActionWithId<"updateRouting", UpdateRoutingPayload>;

function createUpdateRoutingAction(payload: UpdateRoutingPayload): UpdateRouting {
  return withActionId({
    type: "updateRouting",
    payload,
  });
}

export type NotifyReady = ActionWithId<"notifyReady", {}>;

function createNotifyReadyAction(): NotifyReady {
  return withActionId({
    type: "notifyReady",
    payload: {},
  });
}

export type RequestPermissions = ActionWithId<
  "requestPermissions",
  {
    permissions: AppPermission[];
    redirectPath: string;
  }
>;

export type FormPayloadUpdate = ActionWithId<
  typeof formPayloadUpdateActionName,
  AllFormPayloadUpdatePayloads
>;

function createRequestPermissionsAction(
  permissions: AppPermission[],
  redirectPath: string,
): RequestPermissions {
  return withActionId({
    type: "requestPermissions",
    payload: {
      permissions,
      redirectPath,
    },
  });
}

export type PopupClose = ActionWithId<"popupClose", {}>;

function createPopupCloseAction(): PopupClose {
  return withActionId({
    type: "popupClose",
    payload: {},
  });
}

export type WidgetResizePayload = {
  /**
   * Widget content height in pixels. Must be a positive, finite number.
   */
  height: number;
};

export type WidgetResize = ActionWithId<"widgetResize", WidgetResizePayload>;

const WIDGET_RESIZE_HEIGHT_ERROR = "WidgetResize height must be a positive, finite number.";

function assertValidWidgetResizeHeight(height: unknown): asserts height is number {
  if (typeof height !== "number" || !Number.isFinite(height) || height <= 0) {
    throw new Error(WIDGET_RESIZE_HEIGHT_ERROR);
  }
}

/**
 * Reports the app's content height so the Dashboard can resize the widget iframe
 * to match. Only affects `*_DETAILS_WIDGETS` extensions.
 */
function createWidgetResizeAction(payload: WidgetResizePayload): WidgetResize {
  assertValidWidgetResizeHeight(payload.height);

  return withActionId({
    type: "widgetResize",
    payload: { height: payload.height },
  });
}

export type RefreshEntity = ActionWithId<"refreshEntity", {}>;

/**
 * Asks the Dashboard to refresh the entity active in the current context,
 * e.g. the currently open Order or Product.
 */
function createRefreshEntityAction(): RefreshEntity {
  return withActionId({
    type: "refreshEntity",
    payload: {},
  });
}

export type OpenPopupPayload = {
  /**
   * App-defined identifier of the target POPUP extension, unique per app.
   */
  extensionIdentifier: string;
  /**
   * Arbitrary JSON payload forwarded to the opened popup. Must be
   * JSON-serializable - it's base64-serialized here (see {@link OpenPopupParams})
   * before it leaves the app, so the Dashboard forwards it verbatim.
   */
  params?: unknown;
};

/**
 * Wire payload of the dispatched `openPopup` action. `params` is already
 * base64-serialized into `appParams`, so the Dashboard appends it to the popup
 * iframe URL as-is and the receiving app decodes it back into `appBridgeState`.
 */
export type OpenPopupActionPayload = {
  extensionIdentifier: string;
  appParams?: string;
};

export type OpenPopup = ActionWithId<"openPopup", OpenPopupActionPayload>;

const OPEN_POPUP_IDENTIFIER_ERROR = "OpenPopup extensionIdentifier must be a non-empty string.";

function assertValidExtensionIdentifier(
  extensionIdentifier: unknown,
): asserts extensionIdentifier is string {
  if (typeof extensionIdentifier !== "string" || extensionIdentifier.trim() === "") {
    throw new Error(OPEN_POPUP_IDENTIFIER_ERROR);
  }
}

/**
 * Asks the Dashboard to open one of the same app's POPUP extensions ("full
 * mode"), referenced by its app-defined `identifier`. Only has an effect on
 * Dashboard versions that handle the `openPopup` action type.
 */
function createOpenPopupAction(payload: OpenPopupPayload): OpenPopup {
  assertValidExtensionIdentifier(payload.extensionIdentifier);

  return withActionId({
    type: "openPopup",
    payload: {
      extensionIdentifier: payload.extensionIdentifier,
      appParams:
        payload.params === undefined || payload.params === null
          ? undefined
          : OpenPopupParams.serialize(payload.params),
    },
  });
}

export type TriggerShortcutPayload = {
  /**
   * Dashboard command id from the matching `DashboardShortcut`.
   */
  shortcutId: string;
  /**
   * `KeyboardEvent.key` of the keypress that matched.
   */
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
};

export type TriggerShortcut = ActionWithId<"triggerShortcut", TriggerShortcutPayload>;

const TRIGGER_SHORTCUT_ID_ERROR = "TriggerShortcut shortcutId must be a non-empty string.";
const TRIGGER_SHORTCUT_KEY_ERROR = "TriggerShortcut key must be a non-empty string.";

function assertValidTriggerShortcutPayload(
  payload: TriggerShortcutPayload,
): asserts payload is TriggerShortcutPayload {
  if (typeof payload.shortcutId !== "string" || payload.shortcutId.trim() === "") {
    throw new Error(TRIGGER_SHORTCUT_ID_ERROR);
  }

  if (typeof payload.key !== "string" || payload.key.trim() === "") {
    throw new Error(TRIGGER_SHORTCUT_KEY_ERROR);
  }
}

/**
 * Asks the Dashboard to run a shortcut it previously advertised via
 * `shortcutsChanged`. Only has an effect on Dashboard versions that handle
 * the `triggerShortcut` action type.
 */
function createTriggerShortcutAction(payload: TriggerShortcutPayload): TriggerShortcut {
  assertValidTriggerShortcutPayload(payload);

  return withActionId({
    type: "triggerShortcut",
    payload: {
      shortcutId: payload.shortcutId,
      key: payload.key,
      metaKey: payload.metaKey,
      ctrlKey: payload.ctrlKey,
      altKey: payload.altKey,
      shiftKey: payload.shiftKey,
    },
  });
}

function createFormPayloadUpdateAction(payload: AllFormPayloadUpdatePayloads): FormPayloadUpdate {
  return withActionId({
    type: formPayloadUpdateActionName,
    // @ts-ignore - TODO: For some reason TS is failing here, but this is internal implementation so it doesn't change the public API
    payload,
  });
}

export type Actions =
  | RedirectAction
  | NotificationAction
  | UpdateRouting
  | NotifyReady
  | FormPayloadUpdate
  | RequestPermissions
  | PopupClose
  | WidgetResize
  | RefreshEntity
  | OpenPopup
  | TriggerShortcut;

export const actions = {
  Redirect: createRedirectAction,
  Notification: createNotificationAction,
  UpdateRouting: createUpdateRoutingAction,
  NotifyReady: createNotifyReadyAction,
  RequestPermissions: createRequestPermissionsAction,
  FormPayloadUpdate: createFormPayloadUpdateAction,
  PopupClose: createPopupCloseAction,
  WidgetResize: createWidgetResizeAction,
  RefreshEntity: createRefreshEntityAction,
  OpenPopup: createOpenPopupAction,
  TriggerShortcut: createTriggerShortcutAction,
};
