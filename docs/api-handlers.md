# Api Handlers

Saleor Apps are meant to work in serverless environment, where Cloud Functions are the foundations of server-side code.

Currently, Saleor heavily relies on Next.js, but in the future, other platforms will be supported.

## Required handlers

Saleor requires 2 endpoints to be available for a standalone app:

- Manifest endpoint - Saleor asks for App information like name and permissions
- Register endpoint - Saleor uses it to exchange authorization data

TODO - any other endpoints?

## Api handlers built-in SDK

To hide Saleor internal logic, app-sdk provides handlers factories. They should work with minimal configuration, leaving
App creators space for domain logic.

### Manifest handler factory

Example usage of manifest handler in Next.js

```typescript
// pages/api/manifest.ts

import { createManifestHandler } from "@app-sdk/handlers/next";

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

import { createAppRegisterHandler } from "@app-sdk/handlers/next";
import { VercelAPL } from "./vercel-apl";

export default createAppRegisterHandler({
  apl: new VercelAPL(),
});
```

Options provided to handler factory

```typescript
export type CreateAppRegisterHandlerOptions = {
  apl: APL;
};
```

See [APL](./apl.md) for details what is Auth Persistence Layer in Saleor apps
