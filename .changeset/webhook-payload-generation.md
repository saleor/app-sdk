---
"@saleor/app-sdk": minor
---

Added optional `payloadGeneration` field (`"DEFERRED" | "IMMEDIATE"`) to `WebhookManifest` and to the webhook handler config, so an app can opt a webhook out of deferred payload generation for events that defer it (orders, draft orders, fulfillments, checkouts, variant stock and discounted price events). `SaleorAsyncWebhook.getWebhookManifest()` emits the field when set. It is ignored for sync webhooks and omitted from the manifest when unset. Supported in Saleor 3.23.42+.
