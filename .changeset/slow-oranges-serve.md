---
"@saleor/app-sdk": patch
---

Added `tokenRefresh` event to AppBridge. 

It's meant to be triggered by dashboard, when token is refreshed. 
Apps that use new AppBridge will receive fresh token.

This fixes [this issue](https://github.com/saleor/saleor-app-sdk/issues/222)

For Saleor Cloud where token lives for 24h it was rare, but Saleor can be set to have any token duration, causing app to fail fast.
