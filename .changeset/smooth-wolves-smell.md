---
"@saleor/app-sdk": major
---

Saleor version that was previously represented as a floating number (eg Saleor 3.20 was represented as 3.2) is now a `SaleorSchemaVersion` which is a tuple `major: number, minor: number`. This format is now passed to Manifest handler and webhooks handler
