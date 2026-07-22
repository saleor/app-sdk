import { FormPayloadProductEdit, FormPayloadProductTranslate } from "@/app-bridge/form-payload";

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
  /**
   * Arbitrary payload passed by the `openPopup` App Bridge action when this app
   * was opened as a POPUP from one of its own widgets. Decoded from the iframe
   * URL on load; `undefined` when the app wasn't opened that way.
   */
  appParams?: unknown;
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
