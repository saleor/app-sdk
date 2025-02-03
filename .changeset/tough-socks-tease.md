---
"@saleor/app-sdk": major
---

Breaking change: SDK will no longer check `saleor-domain` header when validating Saleor requests, instead it will check `saleor-api-url` header.

This makes SDK incompatible with Saleor versions prior to 3.15.
