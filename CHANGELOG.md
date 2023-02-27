# @saleor/app-sdk

## 0.32.2

### Patch Changes

- d83c7ab: Test changeset

## 0.32.1

### Patch Changes

- cd25a3b: Add automatic publish to npm after changeset release

## 0.32.0

### Minor Changes

- 9e22a49: Change default behaviour of autoNotifyReady option in AppBridge constructor to be "true"

  This behavior is required by dashboard to send token in handshake in the response

- 195f2d9: Add hooks to createRegisterHandler, allowing to hook into token exchange process or to interrupt it