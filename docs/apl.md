# APL - Auth Persistence Layer

APL is an interface for managing auth data of registered Apps. Implementing it does not restrict you from choosing the right technology for your project (for example Redis, Postgres, S3, etc.), and provides a common set of operations which can be used by your application and functions provided by App SDK.

## Available methods

- `get: (saleorApiUrl: string) => Promise<AuthData | undefined>` - If the entry for given saleorApiUrl exists, returns AuthData object.

- `set: (authData: AuthData) => Promise<void>` - Save auth data.

- `delete: (saleorApiUrl: string) => Promise<void>` - Remove auth data fot the given API URL.

- `getAll: () => Promise<AuthData[]>` - Returns all auth data available.

- `isReady: () => Promise<AplReadyResult>` - Check if persistence layer behind APL is ready. For example: database connection established

- `isConfigured: () => Promise<AplConfiguredResult>` - Check if persistence layer behind APL is configured. For example: env variable required by database connection

## AuthData

Interface containing data used for communication with the Saleor API:

```ts
export interface AuthData {
  domain: string;
  token: string;
  saleorApiUrl: string;
  appId: string;
  jwks: string;
}
```

- `domain` - Domain of the API
- `token` - Authorization token
- `saleorApiUrl` - Full URL to the Saleor GraphQL API
- `appID` - ID of the app assigned during the installation process
- `jwks` - JSON Web Key Set available at `https://<your-saleor-domain>/.well-known/jwks.json`, cached in the APL for the faster webhook validation

## AplReadyResult & ApConfiguredResult

Responses from `isReady()` and `isConfigured()` should match following:

```ts
type AplReadyResult =
  | {
      ready: true;
    }
  | {
      ready: false;
      error: Error;
    };

type AplConfiguredResult =
  | {
      configured: true;
    }
  | {
      configured: false;
      error: Error;
    };
```

## Example implementation

Let's create an APL, which uses Redis for data storage:

```ts
import { createClient } from "redis";
import { APL, AuthData } from "@saleor/app-sdk/types/apl";

const client = createClient();
await client.connect();

const redisAPL: APL = {
  get: async (saleorApiUrl: string) => {
    const response = await client.get(saleorApiUrl);
    if (response) {
      return JSON.parse(response);
    }
    return;
  },
  set: async (authData: AuthData) => {
    await client.set(authData.saleorApiUrl, JSON.stringify(authData));
  },
  delete: async (saleorApiUrl: string) => {
    await client.del(saleorApiUrl);
  },
  getAll: async () => {
    throw new Exception("Not implemented.");
  },
};
```

You'll be able to use it directly:

```ts
import { redisAPL } from "./apl";

const getSavedAuthData = async () => {
  await redisAPL.get("https://demo.saleor.io/graphql/");
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

### Using different APL depending on the environment

Depending on the environment your app is working on, you may want to use a different APL. For example during local development you might like to use `FileAPL`, because it does not require any additional infrastructure. Deployed apps on the other hand need more robust solution.

To handle both scenarios, initialize the proper APLs in your code based on it's environment. In your application code:

```ts
// lib/saleorApp.ts

import { FileAPL, UpstashAPL } from "@saleor/app-sdk/APL";

// Based on environment variable the app will use a different APL:
// - For local development store auth data in the `.auth-data.json`.
// - For app deployment on hosted environment like Vercel, use UpstashAPL
export const apl = process.env.APL === "upstash" ? new UpstashAPL() : new FileAPL();
```

Now you can use it for in your view:

```ts
import { SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";
import { withRegisteredSaleorDomainHeader } from "@saleor/app-sdk/middleware";
import type { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { Response } from "retes/response";

// import created APL
import { apl } from "@lib/saleorApp";

const handler: Handler = async (request) => {
  const saleorApiUrl = request.headers[SALEOR_API_URL_HEADER];

  // Get auth data
  const authData = apl.get(saleorApiUrl);

  // view logic...

  return Response.OK();
};

export default toNextHandler([withRegisteredSaleorDomainHeader({ apl }), handler]);
```

## Available APLs

### FileAPL

File based storage of auth data, intended for local development. Data are stored in the `.saleor-app-auth.json` file. You'll be able to develop app without additional dependencies or infrastructure.

Please note: this APL supports single tenant only (new registrations overwrite previous ones) and should not be used on production.

### UpstashAPL

[Upstash](https://upstash.com) is a Redis SaaS targeting serverless applications. It's free tier is more than enough to start developing multi-tenant Saleor Apps, and credit card info is not required to create an account.

APL implementation use REST endpoints to store the data, so no extra dependencies are required.

To use UpstashAPL, you'll need endpoint URL and password. Both will be available at [dashboard](https://console.upstash.com/) after creating a database. Credentials can be passed to APL during it's creation:

```ts
import { UpstashAPL } from "@saleor/app-sdk/APL";

const apl = new UpstashAPL({
  restToken: "XXXXXXXXXXXXXX",
  restUrl: "https://eu2-red-panda-00000.upstash.io",
});
```

Or using environment variables: `UPSTASH_TOKEN`, `UPSTASH_URL`.
