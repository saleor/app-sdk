import { LocaleCode } from "../locales";
import { AppPermission, Permission } from "../types";
import { ThemeType } from "./events";

export type FormContextTranslateProduct = {
  formId: "translate-product";
  translationLanguage: string;
  productId: string;
  fields: Array<{
    fieldName: string;
    originalValue: string;
    translatedValue: string;
    type: "short" | "rich";
  }>;
};

/**
 * Strong-type all forms as union
 */
export type FormContextPayload = FormContextTranslateProduct;

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
  formContext?: FormContextPayload;
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
