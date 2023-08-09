import {
  GeneratedAppExtensionMountEnum,
  GeneratedAppExtensionTargetEnum,
  GeneratedPermissionEnum,
  GeneratedWebhookEventTypeAsyncEnum,
  GeneratedWebhookEventTypeSyncEnum,
} from "./generated-enums";

export type AppExtensionTarget = GeneratedAppExtensionTargetEnum;

export type AppExtensionMount = GeneratedAppExtensionMountEnum;

/**
 * All permissions that users can have
 * Reference https://docs.saleor.io/docs/3.x/api-reference/enums/permission-enum
 */
export type Permission = GeneratedPermissionEnum;

/**
 * All permissions that App can have.
 */
export type AppPermission = Exclude<Permission, "MANAGE_APPS">;

/**
 * @see https://docs.saleor.io/docs/3.x/api-reference/webhooks/enums/webhook-event-type-async-enum
 */
export type AsyncWebhookEventType = GeneratedWebhookEventTypeAsyncEnum;

/**
 * @see https://github.com/saleor/saleor/blob/main/saleor/graphql/schema.graphql#L1995
 *
 */
export type SyncWebhookEventType = GeneratedWebhookEventTypeSyncEnum;

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
       */
      default: string;
    };
  };
}
