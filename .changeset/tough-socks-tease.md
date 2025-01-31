---
"@saleor/app-sdk": major
---

Breaking change: Remove checking "saleor-domain" header from Saleor requests. It should be replaced with the "saleor-api-url" header.

This makes `@saleor/app-sdk` incompatible with Saleor versions prior to 3.15.
