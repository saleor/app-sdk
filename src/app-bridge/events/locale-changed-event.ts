import { LocaleCode } from "../../locales";
import { DashboardEvent } from "./events-utils";

export const LOCALE_CHANGED_EVENT_TYPE = "localeChanged";

export type LocaleChangedEvent = DashboardEvent<
  typeof LOCALE_CHANGED_EVENT_TYPE,
  {
    locale: LocaleCode;
  }
>;

export function createLocaleChangedEvent(newLocale: LocaleCode): LocaleChangedEvent {
  return {
    type: LOCALE_CHANGED_EVENT_TYPE,
    payload: {
      locale: newLocale,
    },
  };
}
