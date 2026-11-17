---
"@saleor/app-sdk": patch
---

Protected handlers (`createProtectedHandler` and platform equivalents) now pass `authData.jwks` from the APL to `verifyJWT`, so Dashboard tokens are verified against the stored JWKS without a network call. Saleor's remote JWKS is used only when the stored one does not verify the token, e.g. after a key rotation.
