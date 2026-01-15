---
"@saleor/app-sdk": minor
---

DynamoAPL: Now you can inject external logger into constructor to receive and possibly forward inner APL logs

```typescript
  const apl = new DynamoAPL({
        repository: ...,
        externalLogger(message: string, level: "debug"|"error") {
          // E.g. send to Sentry
          captureMessage(message)
        },
      });
```
