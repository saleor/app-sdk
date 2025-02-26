---
"@saleor/app-sdk": major
---

Removed `ctx` parameter from SyncWebhookHandler and replace with standalone `buildSyncWebhookResponsePayload` function

Before

```typescript

new SaleorSyncWebhook(...).createHandler(
  req, res, ctx
) {

  const typeSafePayload = ctx.buildResponse({
    // this must be valid response
  })
}
```

After

```typescript
import { buildSyncWebhookResponsePayload } from "@saleor/app-sdk/handlers/shared";

new SaleorSyncWebhook(...).createHandler(
  req, res, ctx
)
{

  const typeSafePayload = buildSyncWebhookResponsePayload<"ORDER_CALCULATE_TAXES">({
    // this must be valid shape
  })
}
```

This change reduces complexity of TypeScript generics and make it easier to build abstractions on top of built-in handlers
