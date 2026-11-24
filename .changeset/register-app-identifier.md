---
"@saleor/app-sdk": minor
---

Added the optional `appIdentifier` setting to `createAppRegisterHandler`. Set it to the app manifest's `id` to validate the app identity Saleor returns during registration. A mismatch returns 403 `APP_IDENTIFIER_MISMATCH` before auth data is saved.
