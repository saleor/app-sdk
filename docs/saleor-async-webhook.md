# Saleor Async Webhook

Apps are usually connected via webhooks - one App sends a HTTP request to another App, informing about some event or requesting some action to be performed.

To inform your App about events originated from Saleor, you need to expose a webhook handler, which Saleor will call with POST request.

To avoid boilerplate, App SDK provides utility that abstracts connection details, allowing developers to focus on business logic.

Note - this utility works for Saleor Async Webhooks only. Support for Sync webhooks are not yet supported in SDK, but you can write your sync webhook handler
from scratch.

## Creating async webhook with SaleorAsyncWebhook

### Creating webhook handler configuration

To use SaleorAsyncWebhook utility, first create a new instance. It can be created in your API handler file

```typescript
// pages/api/webhooks/order-created.ts

/**
 * To be type safe, define payload from API. This should be imported from generated graphQL code
 */
type OrderPayload = {
  id: string;
};

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderPayload>({
  /**
   * Name of the webhook, not required
   */
  name: "Order Created",
  /**
   * Relative path to the webhook, required
   */
  webhookPath: "api/webhooks/order-created",
  /**
   * Event type, required
   */
  asyncEvent: "ORDER_CREATED",
  /**
   * Decide if webhook created during app installation should be active or not
   */
  isActive: true,
  /**
   * Provide APL, read more below
   */
  apl: require("../lib/apl"),
  /**
   * Subscription query, telling Saleor what payload app expects.
   */
  query: "TODO",
});
```

- Check available events [here](todo)
- [Read more about APLs](./apl.md)

You can consider created `orderCreatedWebhook` a center point of your webhook configuration. Now, you need to create a handler and add it to manifest.

### Extending app manifest

Webhooks are created in Saleor when the App is installed. Saleor uses [AppManifest](todo) to get information about webhooks to create.  
`SaleorAsyncWebhook` utility can generate this manifest:

```typescript
// pages/api/manifest

import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import { orderCreatedWebhook } from "./order-created.ts";

export default createManifestHandler({
  manifestFactory({ appBaseUrl }) {
    return {
      /**
       * Add one or more webhook manifests.
       */
      webhooks: [orderCreatedWebhook.getWebhookManifest(appBaseUrl)],
      // ...rest of your App's manifest
    };
  },
});
```

Now, try to read your manifest, in default Next.js config it will be `GET localhost:3000/api/manifest`. You should see webhook configuration as part of manifest response.

### Creating webhook domain logic

Now, let's create a handler that will process webhook data. Let's back to handler file `pages/api/webhooks/order-created.ts`.

```typescript
type OrderPayload = {
  id: string;
};

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderPayload>({
  // ... your configuration
});

export default orderCreatedWebhook.createHandler((req, res, context) => {
  const { baseUrl, event, payload, authData } = context;

  console.log(payload.id); // type is inferred

  // Perform some domain logic

  // End with status 200
  return res.status(200).end();
});
```

### query vs subscriptionQueryAst

todo