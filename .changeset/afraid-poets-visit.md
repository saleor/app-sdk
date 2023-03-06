---
"@saleor/app-sdk": minor
---

Add SaleorSyncWebhook class

Now app-sdk support both `new SaleorAsyncWebhook()` and `new SaleorSyncWebhook()`.

Changes:

Constructor field `subscriptionQueryAst?: ASTNode` in `SaleorAsyncWebhook` has been deprecated.

Use `query` field instead (`query: ASTNode | string`)

Constructor field `asyncEvent` has been deprecated. Use `event` instead
