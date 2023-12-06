---
"@saleor/app-sdk": minor
---

Added VercelKvApl. It will use [Vercel KV Storage](https://vercel.com/docs/storage/vercel-kv) (using Upstash Redis under the hood).

APL requires following env variables:

`KV_URL`,`KV_REST_API_URL`,`KV_REST_API_TOKEN`,`KV_REST_API_READ_ONLY_TOKEN` - KV variables that are automatically linked by Vercel when KV is attached to the project.

`KV_STORAGE_NAMESPACE` - a string identifier that should be unique per app. If more than one app writes with the same `KV_STORAGE_NAMESPACE`, Auth Data will be overwritten and apps can stop working.

For now experimental - can be imported with:

```
import { _experimental_VercelKvApl } from "@saleor/app-sdk/apl";
```
