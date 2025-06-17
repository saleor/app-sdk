---
"@saleor/app-sdk": patch
---

Deprecate `buildSyncWebhookResponsePayload` function. Saleor now exposes JSON schema for webhook response payloads that can be used to generate TypeScript types. See [Saleor docs](https://docs.saleor.io/developer/extending/apps/developing-apps/generating-types-for-sync-webhooks) for more info.
