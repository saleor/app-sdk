---
"@saleor/app-sdk": patch
---

Added abstract `PlatformAdapterInterface` and `ActionHandlerInterface` to enable cross-framework handler implementations.

Next.js handlers were rewritten to use the new interface.
