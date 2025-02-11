---
"@saleor/app-sdk": minor
---

Added handlers for Web API: Request and Response

## Example

This example uses Next.js app router

```ts
/* /app/api/manifest/route.ts */
import { createManifestHandler } from "@saleor/app-sdk/handlers/fetch-api";
// or
import { createManifestHandler } from "@saleor/app-sdk/handlers/next-app-router";

export const GET = createManifestHandler({
  manifestFactory({ appBaseUrl, request }) {
    return {
      name: "Saleor App Template",
      tokenTargetUrl: `${appBaseUrl}/api/register`,
      appUrl: appBaseUrl,
      permissions: ["MANAGE_ORDERS"],
      id: "saleor.app",
      version: "0.0.1",
      webhooks: [orderCreatedWebhook.getWebhookManifest(apiBaseURL)],
      author: "Saleor Commerce",
    };
  },
});
```

```ts
/* /app/api/register/route.ts */
import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/fetch-api";

export const POST = createAppRegisterHandler({
  apl: saleorApp.apl,
});
```

To see more details check these examples:

- [Hono on Deno Deploy](https://github.com/witoszekdev/saleor-app-hono-deno-template)
- [Hono on Cloudflare Pages](https://github.com/witoszekdev/saleor-app-hono-cf-pages-template)
- [Hono on AWS Lambda](https://github.com/witoszekdev/saleor-app-hono-aws-lambda-template)
- [Next.js Edge Runtime](https://github.com/saleor/saleor-app-template/pull/267)
