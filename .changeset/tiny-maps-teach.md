---
"@saleor/app-sdk": patch
---

Changed next.js import paths to include .js suffix, which seems to be required for ESM to work properly (for next/server).
Additionally improved package.json export paths to include dedicated d.mts files
