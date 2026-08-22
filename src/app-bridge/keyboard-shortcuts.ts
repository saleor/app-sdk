import { actions } from "./actions";
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

/**
 * Listen for Dashboard-registered shortcuts on `window` (capture phase) and
 * dispatch `actions.TriggerShortcut` when one matches.
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
        actions.TriggerShortcut({
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
