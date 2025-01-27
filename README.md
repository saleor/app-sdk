<div align="center">
  
[![Discord Badge](https://dcbadge.vercel.app/api/server/H52JTZAtSH)](https://discord.gg/H52JTZAtSH)

</div>

# SDK for Saleor Apps

SDK for building [Saleor Apps](https://github.com/saleor/apps).

<div>

[![npm version badge](https://img.shields.io/npm/v/@saleor/app-sdk)](https://www.npmjs.com/package/@saleor/app-sdk)
[![npm downloads count](https://img.shields.io/npm/dt/@saleor/app-sdk)](https://www.npmjs.com/package/@saleor/app-sdk)

</div>

## 🚨 Alpha phase

App SDK is in the early stage at the moment. Every API below 1.x.x release is likely to change.

Feel free to play with SDK and move its code directly to your app.

## Installing

```bash
npm i @saleor/app-sdk
```

## Docs

You can find the documentation [here](https://docs.saleor.io/docs/3.x/developer/extending/apps/developing-apps/app-sdk/overview).

## Development

### How to link development version to your project

If you would like to develop the SDK and test it with existing project:

1. In the Saleor App SDK directory run command

```bash
pnpm watch
```

Now any code change will trigger build operation automatically.

2. In your project directory:

```bash
pnpm add ../saleor-app-sdk/dist
```

As path to your local copy of the App SDK may be different, adjust it accordingly.

### Code style

Before committing the code, Git pre-hooks will check staged changes for
following the code styles. If you would like to format the code by yourself, run
the command:

```bash
pnpm lint
```

### Running Integration Tests

To run the integration tests (e.g., Redis APL tests), follow these steps:

1. Start a Redis container:

```bash
docker run --name saleor-app-sdk-redis -p 6379:6379 -d redis:7-alpine
```

2. Run the integration tests:

```bash
pnpm test:integration
```

3. (Optional) Clean up the Redis container:

```bash
docker stop saleor-app-sdk-redis
docker rm saleor-app-sdk-redis
```

Note: If your Redis instance is running on a different host or port, you can set the `REDIS_URL` environment variable:

```bash
REDIS_URL=redis://custom-host:6379 pnpm test:integration
```
