import { Values } from "../../helpers";
import { createHandshakeEvent, HANDSHAKE_EVENT_TYPE, HandshakeEvent } from "./handshake-event";
import {
  createLocaleChangedEvent,
  LOCALE_CHANGED_EVENT_TYPE,
  LocaleChangedEvent,
} from "./locale-changed-event";
import { createRedirectEvent, REDIRECT_EVENT_TYPE, RedirectEvent } from "./redirect-event";
import {
  createDispatchResponseEvent,
  DISPATCH_RESPONSE_EVENT_TYPE,
  DispatchResponseEvent,
} from "./response-event";
import { createThemeChangeEvent, THEME_EVENT_TYPE, ThemeEvent } from "./theme-event";
import {
  createTokenRefreshEvent,
  TOKEN_REFRESH_EVENT_TYPE,
  TokenRefreshEvent,
} from "./token-refresh-event";

export type Version = 1;

export const EventType = {
  handshake: HANDSHAKE_EVENT_TYPE,
  response: DISPATCH_RESPONSE_EVENT_TYPE,
  redirect: REDIRECT_EVENT_TYPE,
  theme: THEME_EVENT_TYPE,
  localeChanged: LOCALE_CHANGED_EVENT_TYPE,
  tokenRefresh: TOKEN_REFRESH_EVENT_TYPE,
} as const;

export type EventType = Values<typeof EventType>;

export type Events =
  | HandshakeEvent
  | DispatchResponseEvent
  | RedirectEvent
  | ThemeEvent
  | LocaleChangedEvent
  | TokenRefreshEvent;

export type PayloadOfEvent<
  TEventType extends EventType,
  TEvent extends Events = Events
  // @ts-ignore TODO - why this is not working with this tsconfig? Fixme
> = TEvent extends Event<TEventType, unknown> ? TEvent["payload"] : never;

export const DashboardEventFactory = {
  createThemeChangeEvent,
  createRedirectEvent,
  createDispatchResponseEvent,
  createHandshakeEvent,
  createLocaleChangedEvent,
  createTokenRefreshEvent,
};
