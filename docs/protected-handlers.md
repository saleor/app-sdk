# Protected API handlers

The App SDK provides helpers which ensure, that incoming requests are send from Saleor dashboard. Example of such situation could be a change of the application configuration iframe.

## How to protect the endpoint

First, create handler for your business logic. The only difference from usual NextJS handler is an additional argument `ctx` of type `ProtectedHandlerContext`, which contains additional data related to the request:

```typescript
export type ProtectedHandlerContext = {
  baseUrl: string; // the URL your application is available
  authData: AuthData; // Auth Data which can be used to communicate with the Saleor API
};
```

`createProtectedHandler` will check if:

- the request has `saleor-domain` header
- the domain has been registered, with help of the APL
- the request has `authorization-bearer`
- the auth token is a valid JWT token created by the Saleor running on the given domain

For example purposes our endpoint will only log welcome message:

```typescript
import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";
import { saleorApp } from "../../../saleor-app";

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext
) => {
  console.log(`Greetings from ${ctx.authData.domain}`);
  res.status(200);
};

/**
 * If any of the requirements is failed, an error response will be returned.
 * Otherwise, provided handler function fill be called.
 */
export default createProtectedHandler(handler, saleorApp.apl);
```

To make your requests successfully communicate with the backend, `saleor-domain` and `authorization-bearer` headers are required:

```typescript
fetch("/api/protected", {
  headers: {
    /**
     * Both domain and token are available in the appBridgeState. Based on those
     * headers the backend will check if the request has enough permissions to
     * perform the action.
     */
    "saleor-domain": domain,
    "authorization-bearer": token,
  },
});
```

If you want to read more about `appBridgeState`, check [App Bridge](./app-bridge.md) documentation.
