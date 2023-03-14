---
"@saleor/app-sdk": patch
---

JWKS field in AuthData is no longer required. registerHandler will try to set it for cache purposes, but not every time it is possible. If JWKS is not found, registerHandler will fetch it
