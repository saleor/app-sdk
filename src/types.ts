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

/**
 * All permissions that users can have
 * Reference https://docs.saleor.io/docs/3.x/api-reference/enums/permission-enum
 */
export type Permission =
  | "MANAGE_USERS"
  | "MANAGE_STAFF"
  | "IMPERSONATE_USER"
  | "MANAGE_OBSERVABILITY"
  | "MANAGE_CHECKOUTS"
  | "HANDLE_CHECKOUTS"
  | "HANDLE_TAXES"
  | "MANAGE_TAXES"
  | "MANAGE_CHANNELS"
  | "MANAGE_DISCOUNTS"
  | "MANAGE_GIFT_CARD"
  | "MANAGE_MENUS"
  | "MANAGE_ORDERS"
  | "MANAGE_ORDERS_IMPORT"
  | "MANAGE_PAGES"
  | "MANAGE_PAGE_TYPES_AND_ATTRIBUTES"
  | "HANDLE_PAYMENTS"
  | "MANAGE_PLUGINS"
  | "MANAGE_PRODUCTS"
  | "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES"
  | "MANAGE_SHIPPING"
  | "MANAGE_SETTINGS"
  | "MANAGE_TRANSLATIONS"
  | "MANAGE_APPS";

/**
 * All permissions that App can have.
 */
export type AppPermission = Exclude<Permission, "MANAGE_APPS">;

/**
 * @see https://docs.saleor.io/docs/3.x/api-reference/webhooks/enums/webhook-event-type-async-enum
 */
export type AsyncWebhookEventType =
  | "ACCOUNT_CONFIRMATION_REQUESTED"
  | "ACCOUNT_DELETE_REQUESTED"
  | "ADDRESS_CREATED"
  | "ADDRESS_UPDATED"
  | "ADDRESS_DELETED"
  | "APP_INSTALLED"
  | "APP_UPDATED"
  | "APP_DELETED"
  | "APP_STATUS_CHANGED"
  | "ATTRIBUTE_CREATED"
  | "ATTRIBUTE_UPDATED"
  | "ATTRIBUTE_DELETED"
  | "ATTRIBUTE_VALUE_CREATED"
  | "ATTRIBUTE_VALUE_UPDATED"
  | "ATTRIBUTE_VALUE_DELETED"
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED"
  | "CHANNEL_CREATED"
  | "CHANNEL_UPDATED"
  | "CHANNEL_DELETED"
  | "CHANNEL_STATUS_CHANGED"
  | "GIFT_CARD_CREATED"
  | "GIFT_CARD_UPDATED"
  | "GIFT_CARD_DELETED"
  | "GIFT_CARD_SENT"
  | "GIFT_CARD_STATUS_CHANGED"
  | "GIFT_CARD_METADATA_UPDATED"
  | "MENU_CREATED"
  | "MENU_UPDATED"
  | "MENU_DELETED"
  | "MENU_ITEM_CREATED"
  | "MENU_ITEM_UPDATED"
  | "MENU_ITEM_DELETED"
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "ORDER_PAID"
  | "ORDER_FULLY_PAID"
  | "ORDER_REFUNDED"
  | "ORDER_FULLY_REFUNDED"
  | "ORDER_UPDATED"
  | "ORDER_CANCELLED"
  | "ORDER_EXPIRED"
  | "ORDER_FULFILLED"
  | "ORDER_METADATA_UPDATED"
  | "ORDER_BULK_CREATED"
  | "DRAFT_ORDER_CREATED"
  | "DRAFT_ORDER_UPDATED"
  | "DRAFT_ORDER_DELETED"
  | "SALE_CREATED"
  | "SALE_UPDATED"
  | "SALE_DELETED"
  | "SALE_TOGGLE"
  | "INVOICE_REQUESTED"
  | "INVOICE_DELETED"
  | "INVOICE_SENT"
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_DELETED"
  | "CUSTOMER_METADATA_UPDATED"
  | "COLLECTION_CREATED"
  | "COLLECTION_UPDATED"
  | "COLLECTION_DELETED"
  | "COLLECTION_METADATA_UPDATED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "PRODUCT_MEDIA_CREATED"
  | "PRODUCT_MEDIA_UPDATED"
  | "PRODUCT_MEDIA_DELETED"
  | "PRODUCT_METADATA_UPDATED"
  | "PRODUCT_VARIANT_CREATED"
  | "PRODUCT_VARIANT_UPDATED"
  | "PRODUCT_VARIANT_DELETED"
  | "PRODUCT_VARIANT_OUT_OF_STOCK"
  | "PRODUCT_VARIANT_BACK_IN_STOCK"
  | "PRODUCT_VARIANT_STOCK_UPDATED"
  | "PRODUCT_VARIANT_METADATA_UPDATED"
  | "CHECKOUT_CREATED"
  | "CHECKOUT_UPDATED"
  | "CHECKOUT_FULLY_PAID"
  | "CHECKOUT_METADATA_UPDATED"
  | "FULFILLMENT_CREATED"
  | "FULFILLMENT_CANCELED"
  | "FULFILLMENT_APPROVED"
  | "FULFILLMENT_METADATA_UPDATED"
  | "NOTIFY_USER"
  | "PAGE_CREATED"
  | "PAGE_UPDATED"
  | "PAGE_DELETED"
  | "PAGE_TYPE_CREATED"
  | "PAGE_TYPE_UPDATED"
  | "PAGE_TYPE_DELETED"
  | "PERMISSION_GROUP_CREATED"
  | "PERMISSION_GROUP_UPDATED"
  | "PERMISSION_GROUP_DELETED"
  | "SHIPPING_PRICE_CREATED"
  | "SHIPPING_PRICE_UPDATED"
  | "SHIPPING_PRICE_DELETED"
  | "SHIPPING_ZONE_CREATED"
  | "SHIPPING_ZONE_UPDATED"
  | "SHIPPING_ZONE_DELETED"
  | "SHIPPING_ZONE_METADATA_UPDATED"
  | "STAFF_CREATED"
  | "STAFF_UPDATED"
  | "STAFF_DELETED"
  | "TRANSACTION_ACTION_REQUEST"
  | "TRANSACTION_ITEM_METADATA_UPDATED"
  | "TRANSLATION_CREATED"
  | "TRANSLATION_UPDATED"
  | "WAREHOUSE_CREATED"
  | "WAREHOUSE_UPDATED"
  | "WAREHOUSE_DELETED"
  | "WAREHOUSE_METADATA_UPDATED"
  | "VOUCHER_CREATED"
  | "VOUCHER_UPDATED"
  | "VOUCHER_DELETED"
  | "VOUCHER_METADATA_UPDATED"
  | "OBSERVABILITY"
  | "THUMBNAIL_CREATED";
/**
 * @see https://github.com/saleor/saleor/blob/main/saleor/graphql/schema.graphql#L1995
 *
 */
export type SyncWebhookEventType =
  | "CHECKOUT_CALCULATE_TAXES"
  | "ORDER_CALCULATE_TAXES"
  | "SHIPPING_LIST_METHODS_FOR_CHECKOUT"
  | "CHECKOUT_FILTER_SHIPPING_METHODS"
  | "ORDER_FILTER_SHIPPING_METHODS"
  | "TRANSACTION_CHARGE_REQUESTED"
  | "TRANSACTION_REFUND_REQUESTED"
  | "TRANSACTION_CANCELATION_REQUESTED"
  | "PAYMENT_GATEWAY_INITIALIZE_SESSION"
  | "TRANSACTION_INITIALIZE_SESSION"
  | "TRANSACTION_PROCESS_SESSION"
  | "LIST_STORED_PAYMENT_METHODS"
  | "STORED_PAYMENT_METHOD_DELETE_REQUESTED"
  | "PAYMENT_GATEWAY_INITIALIZE_TOKENIZATION_SESSION"
  | "PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION"
  | "PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION";

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
  asyncEvents?: AsyncWebhookEventType[];
  syncEvents?: SyncWebhookEventType[];
  /**
   * Query is required for a subscription.
   * If you don't need a payload, you can provide empty query like this:
   *
   * subscription {
   *   event {
   *     __typename
   *   }
   * }
   */
  query: string;
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
  /**
   * Allows app installation for specific Saleor versions, using semver.
   * https://github.com/npm/node-semver#versions
   *
   * If not set, Saleor will allow installation for every version
   *
   * In Saleor versions lower than 3.13, this field will be ignored
   *
   * Examples:
   * ">=3.10" - allow for versions 3.10 or newer
   * ">=3.10 <4" - allow for versions 3.10 and newer, but not 4.0 and newer
   * ">=3.10 <4 || 4.0.0" - 3.10 and newer, less than 4, but allow exactly 4.0.0
   */
  requiredSaleorVersion?: string;
  /**
   * App author name displayed in the dashboard
   *
   * In Saleor versions lower than 3.13, this field will be ignored
   */
  author?: string;
  /**
   * Add brand-specific metadata to the app
   *
   * Available from Saleor 3.15. In previous versions will be ignored
   */
  brand?: {
    /**
     * Logo will be displayed in the dashboard
     */
    logo: {
      /**
       * URL with the public image. File will be copied to Saleor database during installation
       *
       * File should be square and at least 256x256px. Format should be image/png.
       */
      default: string;
    };
  };
}
