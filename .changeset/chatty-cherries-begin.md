---
"@saleor/app-sdk": patch
---

Removed HTTP_METHOD OTEL attributes. They broke displaying of resources when other attributes related to HTTP are not set.
