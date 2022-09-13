import { LocaleCode } from "../locales";
import { Values } from "./helpers";

export type Version = 1;

export const EventType = {
  handshake: "handshake",
  response: "response",
  redirect: "redirect",
  theme: "theme",
  localeChanged: "localeChanged",
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

export type Events =
  | HandshakeEvent
  | DispatchResponseEvent
  | RedirectEvent
  | ThemeEvent
  | LocaleChangedEvent;

export type PayloadOfEvent<
  TEventType extends EventType,
  TEvent extends Events = Events
  // @ts-ignore TODO - why this is not working with this tsconfig? Fixme
> = TEvent extends Event<TEventType, unknown> ? TEvent["payload"] : never;
