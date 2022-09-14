# Cross-env metadata

To achieve Saleor (core) cloning functionalities (e.g. clone staging to production),
apps must be able to maintain their state (config, keys).

At Saleor 3.x this is apps responsibility

It can be achieved with following APIs

## Detecting Saleor Cloud env

Use following middleware

```typescript
export default withSaleorCloudEnvironment((req) => {
  console.log(req.context.saleorCloudEnvironment); // "prod" | "stage"
});
```

## Set cross-env metadata

App config can be set in private metadata, which can contain any json.

There is a built-in helper in app-sdk, that will store a pair of keys

```typescript
const metadataManager = new AppMetadataManager();

metadataManager.set("key", "val"); // For single value for every env

metadataManager.setCrossEnv({
  prod: ["key", "prod value"],
  stage: ["key", "stage value"],
});
```

## Read metadata

```typescript
const metadataManager = new AppMetadataManager();

metadataManager.get("key"); // Expecting single value
metadataManager.get("key", req.context.saleorCloudEnvironment); // Get expected env value
```
