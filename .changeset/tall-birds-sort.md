---
"@saleor/app-sdk": patch
---

Remove MANAGE_APPS from possible permissions, because App should not have it. Mutations that requires MANAGE_APPS will not work with App Token even if permission is set
