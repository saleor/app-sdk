---
"@saleor/app-sdk": minor
---

Fix wrong logic introduced in [0.49.0](https://github.com/saleor/app-sdk/releases/tag/v0.49.0): there is not header `saleor-schema-version` when app-sdk is processing saleor webhook. This header is only present on install request.

Now app-sdk will try to parse version from `version` field on GraphQL subscription [Event](https://docs.saleor.io/docs/3.x/api-storefront/miscellaneous/interfaces/event#code-style-fontweight-normal-eventbversionbcodestring-). If field is not present `null` will be returned.
