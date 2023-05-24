# @saleor/app-sdk

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
