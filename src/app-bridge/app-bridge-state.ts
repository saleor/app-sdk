import { LocaleCode } from "../locales";
import { Permission } from "../types";
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
  user?: {
    /**
     * Original permissions of the user that is using the app.
     * *Not* the same permissions as the app itself.
     *
     * Can be used by app to check if user is authorized to perform
     * domain specific actions
     */
    permissions: Permission[];
    email: string;
  };
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
