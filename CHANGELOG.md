# @saleor/app-sdk

## 0.52.0

### Minor Changes

- 7b51201: Adding REDIS as APL provider

## 0.51.0

### Minor Changes

- 7e9b259: Added VercelKV APL. It provides out-of-the-box integration. See [docs](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl#vercelkvapl)

## 0.50.3

### Patch Changes

- ac4e4a2: Now, the fixed body size limit was removed, this means there is no restriction for size of the webhook payload, sent by Saleor.

## 0.50.2

### Patch Changes

- 0749a6e: Fixed duplicated span.end() called on CloudAPL. This was incorrect invocation - span can be ended just once.

## 0.50.1

### Patch Changes

- d24c734: Added additional debug logs for createManifestHandler utility. Now app with DEBUG env variable will print extra messagess helpful with broken app installations

## 0.50.0

### Minor Changes

- ef61335: Fix wrong logic introduced in [0.49.0](https://github.com/saleor/app-sdk/releases/tag/v0.49.0): there is not header `saleor-schema-version` when app-sdk is processing saleor webhook. This header is only present on install request.

  Now app-sdk will try to parse version from `version` field on GraphQL subscription [Event](https://docs.saleor.io/docs/3.x/api-storefront/miscellaneous/interfaces/event#code-style-fontweight-normal-eventbversionbcodestring-). If field is not present `null` will be returned.

## 0.49.0

### Minor Changes

- 53b8cdc: Parse the `saleor-schema-version` header and include the parsed version in the contexts of `createHandler` and `webhookFactory`. If the header is absent (Saleor version below 3.15), the version will default to `null`. This parsed version enables supporting multiple schemas in a single app, as outlined in the [RFC](https://github.com/saleor/apps/issues/1213).

## 0.48.2

### Patch Changes

- 5a613ed: Removed HTTP_METHOD OTEL attributes. They broke displaying of resources when other attributes related to HTTP are not set.

## 0.48.1

### Patch Changes

- 7529ab7: Added OTEL for VercelKV APL. This APL is still experimental, so the change is marked as patch

## 0.48.0

### Minor Changes

- 30485b7: Added pagination for CloudAPL. Previously if there were more than 100 results it would return only first 100. This change adds an option to configure the page size and automatically paginates through the responses until `next` property is set to null on the response

## 0.47.2

### Patch Changes

- c707e10: Removed OTEL attribute http.method. It eventually caused bad mapping in Datadog -> overwriting span name
- bd48ded: Removed JSON.parse from VercelKVAPL, used raw js objects to read and write them

## 0.47.1

### Patch Changes

- d72d21b: Changed export path of VercelKv APL. Now its not exported from shared index file.

## 0.47.0

### Minor Changes

- 09b9185: Added optional, experimental `cacheManager` property to CloudAPL constructor. By default it doesn't change any behavior
  and it's meant to be used for internal testing.
- f49c63f: Added VercelKvApl. It will use [Vercel KV Storage](https://vercel.com/docs/storage/vercel-kv) (using Upstash Redis under the hood).

  APL requires following env variables:

  `KV_URL`,`KV_REST_API_URL`,`KV_REST_API_TOKEN`,`KV_REST_API_READ_ONLY_TOKEN` - KV variables that are automatically linked by Vercel when KV is attached to the project.

  `KV_STORAGE_NAMESPACE` - a string identifier that should be unique per app. If more than one app writes with the same `KV_STORAGE_NAMESPACE`, Auth Data will be overwritten and apps can stop working.

  For now experimental - can be imported with:

  ```
  import { _experimental_VercelKvApl } from "@saleor/app-sdk/apl";
  ```

### Patch Changes

- 9a5c858: Added missing HTTP.METHOD attribute to APL calls
- 6ddb7f4: Fixed bug where FileAPL.GET failed to read data when optional fields were not set (jwks, domain).
- 828490b: Improved JSDoc for AppManifest.brand.logo, now it explains format and size of the image

## 0.46.0

### Minor Changes

- ecef61d: Added OTEL spans around several app-sdk methods, like CloudApl and token verification methods.
- 3c68c4c: Added definition for payment and transaction events. From now on, sync webhook factory will autocomplete response expected by Saleor
- 3c68c4c: Added new permission - MANAGE_ORDERS_IMPORT - to Permission type
- 3c68c4c: Added missing payment transactions sync events

## 0.45.0

### Minor Changes

- d1c30dc: Changed behavior or Saleor Cloud APL - get method. Prevoiusly ANY error was catched and method returned "undefined". Now only 404-like errors will return "undefined" and error like 5xx, timeouts, wrong body, etc. will result with thrown error. This is technically a breaking change on function level, but in the end app will fail anyway - if APL is not found, it can't proceed. Now error is thrown earlier. It should help with debugging and better custom error handling.

### Patch Changes

- b5c4429: Fixed URLs to docs inline code and errors. Now they point to Saleor Docs website, instead local docs that were removed

## 0.44.0

### Minor Changes

- 3e31b3a: Changed the "query" field in the AppManifest webhook to be required. Previously, this field was optional.

  For subscription events, Saleor rejects webhooks without query, so this field was valid only with legacy non-subscription webhooks.

  Now, the query is obligatory.

  **Warning: This can be a breaking change for some scenarios where legacy webhooks were used!**

### Patch Changes

- 8ff42af: Added export path "@saleor/app-sdk/types". It was accessible but not correctly marked in package.json. Now its added in "exports" field which should fix some bundles and IDEs
- e04d6c0: Bumped semver from 5.7.1 to 5.7.2

## 0.43.1

### Patch Changes

- 357557a: Removed unused package.json's index and typing, which were never built and bundled
- 8db1d56: Updated dependencies
- 357557a: Removed exported "util" that was never bundled

## 0.43.0

### Minor Changes

- 1118ea9: Added new actions and events for dynamic permissions request.

  Now App can ask Dashboard to grant more permissions than originally assigned.

  Operation can be approved or rejected by the user.

  This feature is available in Saleor 3.15 and higher

## 0.42.0

### Minor Changes

- b8935a8: Added "appPermissions" field to AppBridgeState. Now, when app is mounted and handshake is complete, app will automatically extract permissions and save them.
- b8935a8: Exposed "@saleor/app-sdk/headers" path. It contains helper methods: getSaleorHeaders and getBaseUrl

## 0.41.1

### Patch Changes

- 4b7875a: Updated AsyncWebhookEventType enum.

## 0.41.0

### Minor Changes

- 86d963e: Added NextApiRequest to context of createManifestHandler. Now you can read native request to construct more specific manifest based on request params
- b365c7c: Added saleorVersion and dashboardVersion fields to AppBridge state. They are optional - will be provided from 3.15.

## 0.40.1

### Patch Changes

- 9fefd72: Fixed invalid ProtectedHandlerContext that didnt include new user field

## 0.40.0

### Minor Changes

- 1d08329: Added "brand" field to Manifest type, that allows to provide app's logo URL. It will work from Saleor 3.15
- 390fae2: Extended context argument in createProtectedHandler. Now it contains "user" object with email and permissions

## 0.39.2

### Patch Changes

- 9056e76: Added definitions for new async events:

  - `CHECKOUT_FULLY_PAID`
  - `GIFT_CARD_SENT`

## 0.39.1

### Patch Changes

- 1783f47: Improved typings in metadata manager

## 0.39.0

### Minor Changes

- d4169dc: Added new method to SettingsManager - "delete". It can delete metadata by key in Saleor. Implemented in MetadataManager and EncryptedMetadataManager

### Patch Changes

- f809368: Added `tokenRefresh` event to AppBridge.

  It's meant to be triggered by dashboard, when token is refreshed.
  Apps that use new AppBridge will receive fresh token.

  This fixes [this issue](https://github.com/saleor/saleor-app-sdk/issues/222)

  For Saleor Cloud where token lives for 24h it was rare, but Saleor can be set to have any token duration, causing app to fail fast.

## 0.38.0

### Minor Changes

- da351fa: Added JWT token expire date validation (claims.exp field). If token is expired, error will be thrown and verification will be aborted

### Patch Changes

- 62e4c39: Registed Handler now prints saleorApiUrl in error response, so its available in dashboard toast
- 62e4c39: Wrapped useAuthenticatedFetch with useMemo to avoid re-renders
- c777275: Fixed SaleorCloudAPL "getAll" method that was not mapping response from remote with AuthData interface
- c777275: Added additional debug log if saleorApiUrl doesnt exist in register handler

## 0.37.4

### Patch Changes

- 7c6c164: Improved and fixed debug logs in createAppRegistedHandler
- 11b793b: Changed import type from next/router, that fixes Next 13.3.1 build

## 0.37.3

### Patch Changes

- 5057d34: Support comma-delimited x-forwarded-proto
- 5a68bec: Fix serialization of the nested values in the UpstashAPL.
- ab24968: processProtectedHandler no longer requires a full NextApiRequest object as an argument. Now only the `headers` property is required to satisfy the type safety.

  Thanks to that, some requests like HTML <form> with tokens in BODY can be validated. Till now only fetch/ajax calls could have been validated

## 0.37.2

### Patch Changes

- b108460: Added definitions for new sync events for payments:

  - `TRANSACTION_CHARGE_REQUESTED`
  - `TRANSACTION_REFUND_REQUESTED`
  - `TRANSACTION_CANCELATION_REQUESTED`
  - `PAYMENT_GATEWAY_INITIALIZE_SESSION`
  - `TRANSACTION_INITIALIZE_SESSION`
  - `TRANSACTION_PROCESS_SESSION`

## 0.37.1

### Patch Changes

- 96ffb92: Restores MANAGE_APPS to Permissions, but remove it from AppPermissions

## 0.37.0

### Minor Changes

- 6e748e3: Add author field to AppManifest

## 0.36.0

### Minor Changes

- 5744aa4: Add requiredSaleorVersion field to AppManifest, so Saleor can validate it during installation
- dfd632b: Add EnvAPL which is a read-only single-tenant APL implementation. It can print AuthData from registration process, but the developer is responsible to configure ENV and pass data to the constructor.
- f7d38dc: Added useAuthenticatedFetch hook with can construct decorated window.fetch with pre-defined headers with required AppBridge state. Can be used with createProtectedHandler

### Patch Changes

- dfd632b: "domain" field in AuthData is no longer required. It will be set by registerHandler, but if missing, domain can be resolved from saleorApiUrl
- dfd632b: JWKS field in AuthData is no longer required. registerHandler will try to set it for cache purposes, but not every time it is possible. If JWKS is not found, registerHandler will fetch it
- f7d38dc: Remove MANAGE_APPS from possible permissions, because App should not have it. Mutations that requires MANAGE_APPS will not work with App Token even if permission is set

## 0.34.2

### Patch Changes

- 3786c86: Original error messages from Upstash in UpstashAPL are now exposed in debug logs
- 172de4a: Chore: Added template for github feature request
- 1d7af07: Removed unused @types/node-fetch, since app-sdk no longer uses it (Node 18 has built-in fetch, for older node.js version polyfill is required)

## 0.34.1

### Patch Changes

- 75eff60: Exported SyncWebhookResponsesMap so it can be imported by app

## 0.34.0

### Minor Changes

- 9420209: Add SaleorSyncWebhook class

  Now app-sdk support both `new SaleorAsyncWebhook()` and `new SaleorSyncWebhook()`.

  Changes:

  Constructor field `subscriptionQueryAst?: ASTNode` in `SaleorAsyncWebhook` has been deprecated.

  Use `query` field instead (`query: ASTNode | string`)

  Constructor field `asyncEvent` has been deprecated. Use `event` instead

## 0.33.0

### Minor Changes

- a939281: Register handler hooks will now respond with errors parsable by the dashboard. "Body" in error was removed, so client code can provide message and status.

### Patch Changes

- 5a93a16: Fix typo in UpstashAPL docs

## 0.32.0

### Minor Changes

- 9e22a49: Change default behaviour of autoNotifyReady option in AppBridge constructor to be "true"

  This behavior is required by dashboard to send token in handshake in the response

- 195f2d9: Add hooks to createRegisterHandler, allowing to hook into token exchange process or to interrupt it
