# @saleor/app-sdk

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
