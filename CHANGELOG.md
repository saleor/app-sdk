# @saleor/app-sdk

## 0.34.2

### Patch Changes

- 3786c86: Original error messages from Upstash in UpstashAPL are now exposed in debug logs
- 172de4a: Chore: Added template for github feature request
- 1d7af07: Removed unused @types/node-fetch, since sdk no longer uses it (Node 18 has built-in fetch, for older node.js version polyfill is required)

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
