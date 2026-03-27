---
"@saleor/app-sdk": minor
---

Apps can now access raw request body as parsed JSON which was sent by Saleor in the `createAppRegisterHandler` callbacks:

- `onRequestVerified`
- `onAuthAplSaved`
- `onAplSetFailed`

This feature is mainly meant for internal Saleor Cloud usage.
