---
"@saleor/app-sdk": minor
---

Added pagination for CloudAPL. Previously if there were more than 100 results it would return only first 100. This change adds an option to configure the page size and automatically paginates through the responses until `next` property is set to null on the response
