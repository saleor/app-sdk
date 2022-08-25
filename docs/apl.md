# APL - Auth Persistance Layer

APL is an interface for managing auth data of registered Apps. Implementing it does not restrict you from choosing the right technology for your project (for example Redis, Postgres, S3, etc.), and provides a common set of operations which can be used by your application and functions provided by App SDK.

## Available methods

- `get: (domain: string) => Promise<AuthData | undefined>` - If the entry for given domain exists, returns AuthData (`{ domain: string, token: string }`) object.

- `set: (authData: AuthData) => Promise<void>` - Save auth data.

- `delete: (domain: string) => Promise<void>` - Remove auth data fot the given domain.

- `getAll: () => Promise<AuthData[]>` - Returns all auth data available.

## Example implementation

Let's create an APL, which uses redis for data storage:

```ts
import { createClient } from "redis";
import { APL, AuthData } from "@saleor/app-sdk/types/apl";

const client = createClient();
await client.connect();

const redisAPL: APL = {
  get: async (domain: string) => {
    const token = await client.get(domain);
    if (token) {
      return { token, domain };
    }
    return;
  },
  set: async (authData: AuthData) => {
    await client.set(authData.domain, authData.token);
  },
  delete: async (domain: string) => {
    await client.del(domain);
  },
  getAll: async () => {
    throw new Exception("Not implemented.");
  },
};
```

You'll be able to use it directly:

```ts
import { redisAPL } from "./apl";

const createTestData = async () => {
  await redisAPL.set({ domain: "example.com ", token: "test-token" });
};
```

And with middleware from the SDK:

```ts
import { withRegisteredSaleorDomainHeader } from "@saleor/app-sdk/middleware";
import { redisAPL } from "./apl";

const handler = async (request) => {
  return Response.OK({ message: "If you see this, your app is registered!" });
};

// the middleware will reject request if it's domain has not been registered
export default withRegisteredSaleorDomainHeader({ apl: redisAPL })(handler);
```
