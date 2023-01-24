import { LocaleCode } from "../locales";
import { ThemeType } from "./events";

export type AppBridgeState = {
  token?: string;
  id: string;
  ready: boolean;
  domain: string;
  path: string;
  theme: ThemeType;
  locale: LocaleCode;
  saleorApiUrl: string;
};

type Options = {
  initialLocale?: LocaleCode;
  initialTheme?: ThemeType;
};

export class AppBridgeStateContainer {
  private state: AppBridgeState = {
    id: "",
    domain: "",
    saleorApiUrl: "",
    ready: false,
    path: "/",
    theme: "light",
    locale: "en",
  };

  constructor(options: Options = {}) {
    this.state.locale = options.initialLocale ?? this.state.locale;
    this.state.theme = options.initialTheme ?? this.state.theme;
  }

  getState() {
    return this.state;
  }

  setState(newState: Partial<AppBridgeState>) {
    this.state = {
      ...this.state,
      ...newState,
    };

    return this.state;
  }
}
