---
"@saleor/app-sdk": patch
---

Fixed duplicated span.end() called on CloudAPL. This was incorrect invocation - span can be ended just once.
