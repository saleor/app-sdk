---
"@saleor/app-sdk": patch
---

Added export path "@saleor/app-sdk/types". It was accessible but not correctly marked in package.json. Now its added in "exports" field which should fix some bundles and IDEs
