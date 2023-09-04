---
"@saleor/app-sdk": patch
---

In AppManifest, webhook query field is not required. Saleor rejects empty query, so Manifest was wrong before with with field optional

This is technically a breaking change, but app without a query specified couldn't be installed in Saleor.

Now Typescript will early show the error
