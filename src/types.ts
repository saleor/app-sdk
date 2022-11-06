export type AppExtensionTarget = "POPUP" | "APP_PAGE";

export type AppExtensionMount =
  | "PRODUCT_DETAILS_MORE_ACTIONS"
  | "PRODUCT_OVERVIEW_CREATE"
  | "PRODUCT_OVERVIEW_MORE_ACTIONS"
  | "NAVIGATION_CATALOG"
  | "NAVIGATION_ORDERS"
  | "NAVIGATION_CUSTOMERS"
  | "NAVIGATION_DISCOUNTS"
  | "NAVIGATION_TRANSLATIONS"
  | "NAVIGATION_PAGES"
  | "ORDER_DETAILS_MORE_ACTIONS"
  | "ORDER_OVERVIEW_CREATE"
  | "ORDER_OVERVIEW_MORE_ACTIONS";

export type AppPermission =
  | "HANDLE_PAYMENTS"
  | "HANDLE_CHECKOUTS"
  | "MANAGE_APPS"
  | "MANAGE_CHECKOUTS"
  | "MANAGE_DISCOUNTS"
  | "MANAGE_GIFT_CARD"
  | "MANAGE_MENUS"
  | "MANAGE_ORDERS"
  | "MANAGE_PAGES"
  | "MANAGE_PLUGINS"
  | "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES"
  | "MANAGE_PRODUCTS"
  | "MANAGE_SETTINGS"
  | "MANAGE_SHIPPING"
  | "MANAGE_STAFF"
  | "MANAGE_TRANSLATIONS"
  | "MANAGE_USERS";

export type WebhookEvent = string;

export interface AppExtension {
  /** Name which will be displayed in the dashboard */
  label: string;
  /** the place where the extension will be mounted */
  mount: AppExtensionMount;
  /** Method of presenting the interface
    `POPUP` will present the interface in a modal overlay
    `APP_PAGE` will navigate to the application page
    @default `POPUP`
  */
  target: AppExtensionTarget;
  permissions: AppPermission[];
  /** URL of the view to display;
    you can skip the domain and protocol when target is set to `APP_PAGE`, or when your manifest defines an `appUrl`.

    When target is set to `POPUP`, the url will be used to render an `<iframe>`.
   */
  url: string;
}

export interface WebhookManifest {
  name: string;
  asyncEvents?: WebhookEvent[];
  syncEvents?: WebhookEvent[];
  /** If query is not provided, the default webhook payload will be used */
  query?: string;
  /** The full URL of the endpoint where request will be sent */
  targetUrl: string;
  isActive?: boolean;
}

export interface AppManifest {
  /** ID of the application used internally by Saleor */
  id: string;
  version: string;
  /** App's name displayed in the dashboard */
  name: string;
  /** Description of the app displayed in the dashboard */
  about?: string;
  /** Array of permissions requested by the app */
  permissions: AppPermission[];
  /** App website rendered in the dashboard */
  appUrl: string;
  /** Address to the app configuration page, which is rendered in the dashboard
    @deprecated in Saleor 3.5, use appUrl instead
  */
  configurationUrl?: string;
  /** Endpoint used during process of app installation

    @see [Installing an app](https://docs.saleor.io/docs/3.x/developer/extending/apps/installing-apps#installing-an-app) 
  */
  tokenTargetUrl: string;
  /** Short description of privacy policy displayed in the dashboard

    @deprecated in Saleor 3.5, use dataPrivacyUrl instead
  */
  dataPrivacy?: string;
  /** URL to the full privacy policy */
  dataPrivacyUrl?: string;
  /**  External URL to the app homepage */
  homepageUrl?: string;
  /** External URL to the page where app users can find support */
  supportUrl?: string;
  /** List of extensions that will be mounted in Saleor's dashboard

  @see For details, please see the [extension section](https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps#key-concepts)
  */
  extensions?: AppExtension[];
  /** List of webhooks that will be set.
  
  @see For details, please look at [asynchronous webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks),
  [synchronous-webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/synchronous-webhooks/key-concepts)
  and [webhooks' subscription](https://docs.saleor.io/docs/3.x/developer/extending/apps/subscription-webhook-payloads)

  Be aware that subscription queries are required in manifest sections
  */
  webhooks?: WebhookManifest[];
}
