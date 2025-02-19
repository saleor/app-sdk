---
"@saleor/app-sdk": major
---

### APL

- `isReady` and `isConfigured` methods are now optional in the `APL` interface
- All APL implementations are now exported from dedicated paths `@saleor/app-sdk/APL/*` where `*` is one of the implementations. Now tree shaking is available
