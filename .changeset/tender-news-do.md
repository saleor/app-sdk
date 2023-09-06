---
"@saleor/app-sdk": patch
---

Changed the "query" field in the AppManifest webhook to be required. Previously, this field was optional.

For subscription events, Saleor rejects webhooks without query, so this field was valid only with legacy non-subscription webhooks.

Now, the query is obligatory.

Warning: This can be a breaking change for some scenarios where legacy webhooks were used!
