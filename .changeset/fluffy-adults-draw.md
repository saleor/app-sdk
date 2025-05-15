---
"@saleor/app-sdk": patch
---

Added optional second generic parameter to `buildSyncWebhookResponsePayload` called `SaleorVersion`.
This change improves TypeScript type safety when working with different Saleor versions that have varying payload requirements.

After this change you can for example use `buildSyncWebhookResponsePayload` with different version and differently type responses:

```ts
// 3.20 is default `SaleorVersion` so you can also write `buildSyncWebhookResponsePayload<TRANSACTION_CHARGE_REQUESTED>`
const respOne = buildSyncWebhookResponsePayload<"TRANSACTION_CHARGE_REQUESTED", "3.20">({
  result: "CHARGE_SUCCESS",
  amount: 100, // Required in 3.20
});

const respTwo = buildSyncWebhookResponsePayload<"TRANSACTION_CHARGE_REQUESTED", "3.21">({
  result: "CHARGE_SUCCESS", // amount is optional in 3.21
});
```
