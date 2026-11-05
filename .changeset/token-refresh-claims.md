---
"@saleor/app-sdk": patch
---

`appBridgeState.appPermissions` and `appBridgeState.user` now update when the Dashboard sends a new token with `tokenRefresh`, and `useAppBridge()` re-renders on every App Bridge event. Before, both kept the values from the handshake token, and `useAppBridge()` kept returning the old token until some other event arrived. For example, after a user approved new app permissions, the app could keep showing the old ones until a page reload.
