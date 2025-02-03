---
"@saleor/app-sdk": major
---

Removed deprecated fields fields and methods in `/handlers`:

- `SaleorAsyncWebhook` and `SaleorSyncWebhook` - removed `asyncEvent` and `subscriptionQueryAst`
- Removed `processSaleorWebhook` and `processProtectedHandler` methods
- Some types were moved from `/next` to `/shared`
