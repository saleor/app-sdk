# SDK for Saleor Apps

SDK for building great [Saleor Apps](https://github.com/saleor/saleor-app-template).

<div>

[![npm version badge](https://img.shields.io/npm/v/@saleor/app-sdk)](https://www.npmjs.com/package/@saleor/app-sdk)
[![npm downloads count](https://img.shields.io/npm/dt/@saleor/app-sdk)](https://www.npmjs.com/package/@saleor/app-sdk)

</div>

## 🚨 Alpha phase

App SDK is on early, alpha stage at the moment. Every API below 1.x.x release is likely to change.

Feel free to play with SDK and to move its code to your app directly

## Installing

```bash
npm i @saleor/app-sdk
```

## Docs

- [AppBridge](./docs/app-bridge.md) - communication layer between Saleor App and Dashboard

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
