---
"@saleor/app-sdk": patch
---

"domain" field in AuthData is no longer required. It will be set by registerHandler, but if missing, domain can be resolved from saleorApiUrl
