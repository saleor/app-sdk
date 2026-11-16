---
"@saleor/app-sdk": minor
---

`verifyJWT` no longer downloads Saleor's JWKS on every call.

Before: every call created a new remote JWKS, so each Dashboard request (each tRPC procedure in a batch) fetched `/.well-known/jwks.json` from Saleor, adding about 100-800 ms.

After:

- `verifyJWT` accepts an optional `jwks` argument. Pass `authData.jwks` from the APL and the token is checked against it without a network call. If that check fails, for example after a key rotation, the remote JWKS is used.
- The remote JWKS is kept per Saleor URL across calls, so jose's cache applies: keys are kept for 10 minutes, fetched again when an unknown key ID appears, and concurrent calls share one fetch.
