<div align="center">
  
[![Discord Badge](https://dcbadge.vercel.app/api/server/H52JTZAtSH)](https://discord.gg/H52JTZAtSH)

</div>

# SDK for Saleor Apps

SDK for building great [Saleor Apps](https://github.com/saleor/apps).

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

## Examples

You can find examples of using the SDK in the [examples](./examples) directory.

The examples are based on the [Saleor App Template](https://www.github.com/saleor/saleor-app-template).

The `examples` directory contains:

- `async-webhook-handler` - an exemplary implemention of ProductUpdated webhook handler. See: `src/pages/api/webhooks/saleor/product-updated.ts`.
- `dashboard-extensions` - an example of implementing a dashboard extension. See: `src/pages/api/manifest.ts`.
- `external-webhook` - an example implementation of an app receiving webhooks from an external service. See: `src/pages/api/giftcard-service/new-giftcard.ts`.
- `metadata-manager` - an example of implementing a [metadata manager](https://docs.saleor.io/docs/3.x/developer/extending/apps/developing-apps/apps-patterns/persistence-with-metadata-manager). See: `src/pages/api/settings.ts`.
- `protected-route` - an example usage of `createProtectedHandler` function to make sure that only the authorized app can access the page. See: `src/pages/api/protected.ts`.
- `trpc` - an example of implementing an app that uses [tRPC](https://trpc.io/).
