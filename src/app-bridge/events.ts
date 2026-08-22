import { AllFormPayloads, formPayloadEventName } from "@/app-bridge/form-payload";

import { LocaleCode } from "../locales";
import { Values } from "./helpers";

export type Version = 1;

export const EventType = {
  handshake: "handshake",
  response: "response",
  redirect: "redirect",
  theme: "theme",
  localeChanged: "localeChanged",
  tokenRefresh: "tokenRefresh",
  formPayload: formPayloadEventName,
  /**
   * Dashboard advertises (or replaces) the keyboard shortcuts it owns.
   * Full-replace semantics — send `[]` to revoke all.
   */
  shortcutsChanged: "shortcutsChanged",
} as const;

export type EventType = Values<typeof EventType>;

type Event<Name extends EventType, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

export type HandshakeEvent = Event<
  "handshake",
  {
    token: string;
    version: Version;
    saleorVersion?: string;
    dashboardVersion?: string;
  }
>;

export type DispatchResponseEvent = Event<
  "response",
  {
    actionId: string;
    ok: boolean;
  }
>;

export type RedirectEvent = Event<
  "redirect",
  {
    path: string;
  }
>;

export type ThemeType = "light" | "dark";
export type ThemeEvent = Event<
  "theme",
  {
    theme: ThemeType;
  }
>;

export type LocaleChangedEvent = Event<
  "localeChanged",
  {
    locale: LocaleCode;
  }
>;

export type TokenRefreshEvent = Event<
  "tokenRefresh",
  {
    token: string;
  }
>;

export type FormDataEvent = Event<typeof formPayloadEventName, AllFormPayloads>;

/**
 * A keyboard shortcut the Dashboard owns and wants forwarded out of the iframe.
 *
 * `key` is matched against `KeyboardEvent.key` case-insensitively. Modifier
 * flags are exact: a registered Cmd+K does not match Cmd+Shift+K.
 */
export type DashboardShortcut = {
  /**
   * Stable Dashboard command id, echoed back in `actions.TriggerShortcut`.
   * e.g. `"commandPalette.open"`.
   */
  id: string;
  /**
   * `KeyboardEvent.key`, matched case-insensitively.
   */
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export type ShortcutsChangedEvent = Event<
  "shortcutsChanged",
  {
    shortcuts: DashboardShortcut[];
  }
>;

export type Events =
  | HandshakeEvent
  | DispatchResponseEvent
  | RedirectEvent
  | ThemeEvent
  | LocaleChangedEvent
  | TokenRefreshEvent
  | FormDataEvent
  | ShortcutsChangedEvent;

export type PayloadOfEvent<
  TEventType extends EventType,
  TEvent extends Events = Events,
  // @ts-ignore TODO - why this is not working with this tsconfig? Fixme
> = TEvent extends Event<TEventType, unknown> ? TEvent["payload"] : never;

export const DashboardEventFactory = {
  createThemeChangeEvent(theme: ThemeType): ThemeEvent {
    return {
      payload: {
        theme,
      },
      type: "theme",
    };
  },
  createRedirectEvent(path: string): RedirectEvent {
    return {
      type: "redirect",
      payload: {
        path,
      },
    };
  },
  createDispatchResponseEvent(actionId: string, ok: boolean): DispatchResponseEvent {
    return {
      type: "response",
      payload: {
        actionId,
        ok,
      },
    };
  },
  createHandshakeEvent(
    token: string,
    // eslint-disable-next-line default-param-last
    version: Version = 1,
    saleorVersions?: {
      dashboard: string;
      core: string;
    },
  ): HandshakeEvent {
    return {
      type: "handshake",
      payload: {
        token,
        version,
        saleorVersion: saleorVersions?.core,
        dashboardVersion: saleorVersions?.dashboard,
      },
    };
  },
  createLocaleChangedEvent(newLocale: LocaleCode): LocaleChangedEvent {
    return {
      type: "localeChanged",
      payload: {
        locale: newLocale,
      },
    };
  },
  createTokenRefreshEvent(newToken: string): TokenRefreshEvent {
    return {
      type: "tokenRefresh",
      payload: {
        token: newToken,
      },
    };
  },
  // EXPERIMENTAL
  createFormEvent(formPayload: AllFormPayloads): FormDataEvent {
    return {
      type: formPayloadEventName,
      payload: formPayload,
    };
  },
  /**
   * Full-replace the shortcuts the Dashboard owns. Send immediately after
   * `handshake`, and again whenever the owned set changes (including `[]`
   * to revoke).
   */
  createShortcutsChangedEvent(shortcuts: DashboardShortcut[]): ShortcutsChangedEvent {
    return {
      type: "shortcutsChanged",
      payload: {
        shortcuts,
      },
    };
  },
};
