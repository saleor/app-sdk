# SDK for Saleor Apps

SDK for building [Saleor Apps](https://github.com/saleor/apps).

Supports Saleor version 3.20+

<div>
  
<a href="https://www.npmjs.com/package/@saleor/app-sdk">
  <img src="https://img.shields.io/npm/v/@saleor/app-sdk" alt="NPM version badge">
</a>
<a href="https://www.npmjs.com/package/@saleor/app-sdk">
  <img src="https://img.shields.io/npm/dt/@saleor/app-sdk" alt="NPM downloads count">
</a>
 <a href="https://saleor.io/discord">
   <img src="https://img.shields.io/discord/864066819866624010" alt="Discord" >
 </a>

</div>

## Release flow

- The `main` branch is a current, latest branch.
- Branches matching `v[0-9]+.x` (like `v1.x`, v0.x`) are release branches
- PRs should be opened to `main` branch and contain changesets (run `npx changeset`). Once changeset is merged to main, the release PR is opened. After the release PR is merged, the version is being pushed to NPM and changesets are pruned
- To patch older version, commit from `main` (including changeset) should be also ported to release branch (e.g. v0.x). Release branch will also detect changes and open release PR
- To release new major version (e.g. start working on `v2.x` from `v1.x`):
  - Create a legacy release branch (e.g. `v1.x` branch)
  - Mark changeset to `main` with `major` change, which will start counting next `main` releases as `2.x.x`
  - Do not merge release PR until it's ready to be merged
 
### Deploying test snapshots

PRs can be pushed to NPM by adding label to PR `release dev tag`. Workflow will run and print version that has been released.

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
