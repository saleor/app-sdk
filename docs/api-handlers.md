# Api Handlers

Saleor Apps are meant to work in serverless environment, where Cloud Functions are the foundations of server-side code.

Currently, Saleor heavily relies on Next.js, but in the future, other platforms will be supported.

## Required handlers

Saleor requires 2 endpoints to be available for a standalone app:

- Manifest endpoint - Returns JSON object with app properties, like its name or permissions. [Read more](https://docs.saleor.io/docs/3.x/developer/extending/apps/manifest)
- Register endpoint - During the installation process, Saleor sends `POST` request with auth token to this endpoint. [Read more](https://docs.saleor.io/docs/3.x/developer/extending/apps/installing-apps#installation-using-graphql-api)

## Api handlers built-in SDK

To hide Saleor internal logic, app-sdk provides handlers factories. They should work with minimal configuration, leaving
App creators space for domain logic.

### Manifest handler factory

Example usage of manifest handler in Next.js

```typescript
// pages/api/manifest.ts

import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

export default createManifestHandler({
  manifestFactory(context) {
    return {
      name: "My Saleor App",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: [],
      id: "my-saleor-app",
      version: "1",
    };
  },
});
```

Options provided to handler factory

```typescript
type CreateManifestHandlerOptions = {
  manifestFactory(context: { appBaseUrl: string }): AppManifest;
};
```

See [source](./src/handlers/next/create-manifest-handler.ts) for more details. See [manifest](../src/types.ts) too.

### App register handler factory

Example usage of app register handler in Next.js

```typescript
// pages/api/register.ts

import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { UpstashAPL } from "@saleor/app-sdk/APL";

export default createAppRegisterHandler({
  apl: new UpstashAPL({
    restURL: "...",
    restToken: "...",
  }),
  allowedSaleorUrls: ["https://your-saleor.saleor.cloud/graphql/"], // optional, see options below
  async onRequestVerified(req, { authData, respondWithError }) {
    await doSomethingAndBlockInstallation(authData.token).catch((err) => {
      throw respondWithError({ body: "Error, installation will fail" });
    });
  },
});
```

Options provided to handler factory

```typescript
export type CreateAppRegisterHandlerOptions = {
  apl: APL;
  /**
   * Provide your Saleor /graphql/ endpoints (or functions),
   * to allow app registration only in allowed Saleor instances.
   */
  allowedSaleorUrls?: Array<string | ((saleorApiUrl: string) => boolean)>;
  /**
   * Optional
   * Run right after Saleor calls this endpoint
   */
  onRequestStart?(
    request: Request,
    context: {
      authToken?: string;
      saleorDomain?: string;
      saleorApiUrl?: string;
      respondWithError: ({ status, message, body }) => never; // should throw
    }
  ): Promise<void>;
  /**
   * Optional
   * Run after all security checks
   */
  onRequestVerified?(
    request: Request,
    context: {
      authData: AuthData;
      respondWithError: ({ status, message, body }) => never; // should throw
    }
  ): Promise<void>;
  /**
   * Optional
   * Run after APL successfully AuthData, assuming that APL.set will reject a Promise in case of error
   */
  onAuthAplSaved?(
    request: Request,
    context: {
      authData: AuthData;
      respondWithError: ({ status, message, body }) => never; // should throw
    }
  ): Promise<void>;
  /**
   * Optional
   * Run after APL fails to set AuthData
   */
  onAuthAplFailed?(
    request: Request,
    context: {
      authData: AuthData;
      error: unknown;
      respondWithError: ({ status, message, body }) => never; // should throw
    }
  ): Promise<void>;
};
```

See [APL](./apl.md) for details what is Auth Persistence Layer in Saleor apps

### Async Webhook Handler

App SDK provides a utility that helps building (async) webhook handlers, so app can react on Saleor events.

Read about it [here](./saleor-async-webhook.md).
