import { FormPayloadProductEdit } from "@/app-bridge/form-payload-events/event-product-edit";
import { FormPayloadProductTranslate } from "@/app-bridge/form-payload-events/event-product-translate";

import { LocaleCode } from "../locales";
import { AppPermission, Permission } from "../types";
import { ThemeType } from "./events";

export type AppBridgeState = {
  token?: string;
  id: string;
  ready: boolean;
  path: string;
  theme: ThemeType;
  locale: LocaleCode;
  saleorApiUrl: string;
  saleorVersion?: string;
  dashboardVersion?: string;
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
  appPermissions?: AppPermission[];
  formContext: {
    "product-translate"?: FormPayloadProductTranslate;
    "product-edit"?: FormPayloadProductEdit;
  };
};

type Options = {
  initialLocale?: LocaleCode;
  initialTheme?: ThemeType;
};

export class AppBridgeStateContainer {
  private state: AppBridgeState = {
    id: "",
    saleorApiUrl: "",
    ready: false,
    path: "/",
    theme: "light",
    locale: "en",
    formContext: {},
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
