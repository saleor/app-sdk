import { DashboardEvent } from "./events-utils";

export const THEME_EVENT_TYPE = "theme";

// TODO Must be updated to match new Macaw
export type ThemeType = "light" | "dark";

export type ThemeEvent = DashboardEvent<
  typeof THEME_EVENT_TYPE,
  {
    theme: ThemeType;
  }
>;

export function createThemeChangeEvent(theme: ThemeType): ThemeEvent {
  return {
    payload: {
      theme,
    },
    type: THEME_EVENT_TYPE,
  };
}
