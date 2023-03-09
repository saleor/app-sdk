---
"@saleor/app-sdk": patch
---

Removed unused @types/node-fetch, since sdk no longer uses it (Node 18 has built-in fetch, for older node.js version polyfill is required)
