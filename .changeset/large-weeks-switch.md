---
"@saleor/app-sdk": minor
---

Parse the `saleor-schema-version` header and include the parsed version in the contexts of `createHandler` and `webhookFactory`. If the header is absent (Saleor version below 3.15), the version will default to `null`. This parsed version enables supporting multiple schemas in a single app, as outlined in the [RFC](https://github.com/saleor/apps/issues/1213).
