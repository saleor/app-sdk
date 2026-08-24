import { type ActionWithId, withActionId } from "./action-envelope";
import type { AppBridge } from "./app-bridge";
import { SSR } from "./constants";
import type { DashboardShortcut } from "./events";

/**
 * IME composition keyCode. Browsers still emit this on some platforms while
 * the user is composing (e.g. CJK input) even when `isComposing` is set.
 */
const IME_KEYCODE = 229;

export type ShortcutForwarderOptions = {
  /**
   * Return `false` to keep a registered Dashboard shortcut inside the app
   * (the app claims it). Called only after a registry match.
   */
  shouldForward?(event: KeyboardEvent): boolean;
};

const modifierMatches = (registered: boolean | undefined, pressed: boolean): boolean =>
  Boolean(registered) === pressed;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const isDashboardShortcut = (value: unknown): value is DashboardShortcut =>
  typeof value === "object" &&
  value !== null &&
  isNonEmptyString((value as DashboardShortcut).id) &&
  isNonEmptyString((value as DashboardShortcut).key);

/**
 * Narrow a `shortcutsChanged` payload coming off `postMessage` into shortcuts
 * that are safe to match against.
 *
 * The wire is typed but not trusted: a malformed entry would otherwise throw on
 * every keypress, from inside the `keydown` listener. Bad entries are dropped.
 *
 * Exported from this module for in-package use (`AppBridge`, tests). Public API
 * is defined by `index.ts` only — this is not re-exported there.
 */
export const parseDashboardShortcuts = (value: unknown): DashboardShortcut[] => {
  if (!Array.isArray(value)) {
    console.warn("Ignoring shortcutsChanged event: payload.shortcuts is not an array.", value);

    return [];
  }

  const shortcuts = value.filter(isDashboardShortcut);

  if (shortcuts.length !== value.length) {
    console.warn(
      "Dropped malformed entries from shortcutsChanged; each shortcut needs a non-empty `id` and `key`.",
      value,
    );
  }

  return shortcuts;
};

/**
 * Find the first Dashboard-registered shortcut that matches this keypress.
 * Matching is case-insensitive on `key` and exact on every modifier flag.
 */
export const matchDashboardShortcut = (
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  shortcuts: DashboardShortcut[],
): DashboardShortcut | undefined =>
  shortcuts.find(
    (shortcut) =>
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      modifierMatches(shortcut.metaKey, event.metaKey) &&
      modifierMatches(shortcut.ctrlKey, event.ctrlKey) &&
      modifierMatches(shortcut.altKey, event.altKey) &&
      modifierMatches(shortcut.shiftKey, event.shiftKey),
  );

const shouldIgnoreKeydown = (event: KeyboardEvent): boolean =>
  event.repeat || event.isComposing || event.keyCode === IME_KEYCODE;

type TriggerShortcutPayload = {
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

type TriggerShortcut = ActionWithId<"triggerShortcut", TriggerShortcutPayload>;

const TRIGGER_SHORTCUT_ID_ERROR = "TriggerShortcut shortcutId must be a non-empty string.";
const TRIGGER_SHORTCUT_KEY_ERROR = "TriggerShortcut key must be a non-empty string.";

/**
 * Build a `triggerShortcut` action asking Dashboard to run a shortcut it
 * advertised via `shortcutsChanged`.
 *
 * Deliberately not on `actions` and not re-exported from `index.ts`: the payload
 * describes a keypress that actually happened, so it is only meaningful to the
 * forwarder below. Letting apps call it would mean synthesizing input on the
 * user's behalf against an id nothing has verified was ever advertised.
 */
export const createTriggerShortcutAction = (payload: TriggerShortcutPayload): TriggerShortcut => {
  if (typeof payload.shortcutId !== "string" || payload.shortcutId.trim() === "") {
    throw new Error(TRIGGER_SHORTCUT_ID_ERROR);
  }

  if (typeof payload.key !== "string" || payload.key.trim() === "") {
    throw new Error(TRIGGER_SHORTCUT_KEY_ERROR);
  }

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
};

/**
 * Listen for Dashboard-registered shortcuts on `window` (capture phase) and
 * dispatch a `triggerShortcut` action when one matches.
 *
 * Reads the registry from `appBridge.getState()` at keypress time, so a later
 * `shortcutsChanged` event is picked up without re-attaching the listener.
 *
 * @returns Cleanup that removes the listener.
 */
export const createShortcutForwarder = (
  appBridge: AppBridge,
  options: ShortcutForwarderOptions = {},
): (() => void) => {
  if (SSR) {
    return () => undefined;
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (shouldIgnoreKeydown(event)) {
      return;
    }

    const shortcut = matchDashboardShortcut(event, appBridge.getState().dashboardShortcuts ?? []);

    if (!shortcut) {
      return;
    }

    if (options.shouldForward && !options.shouldForward(event)) {
      return;
    }

    event.preventDefault();

    appBridge
      .dispatch(
        createTriggerShortcutAction({
          shortcutId: shortcut.id,
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
        }),
      )
      .catch((error: unknown) => {
        console.warn("TriggerShortcut dispatch failed:", error);
      });
  };

  window.addEventListener("keydown", onKeyDown, true);

  return () => {
    window.removeEventListener("keydown", onKeyDown, true);
  };
};
