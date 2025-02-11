---
"@saleor/app-sdk": major
---

Removed deprecated fields fields and methods in `/handlers`:

- `SaleorAsyncWebhook` and `SaleorSyncWebhook` - removed deprecated `asyncEvent` and `subscriptionQueryAst`
- Removed `processSaleorWebhook` and `processProtectedHandler` methods in favor of `SaleorSyncWebhook`, `SaleorAsyncWebhook` classes and `createProtectedHandler` handler
- Some types were moved from `/next` to `/shared`
