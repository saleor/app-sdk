---
"@saleor/app-sdk": minor
---

`next`, `react`, `react-dom`, `graphql` peer dependencies are now marked as optional, since only certain entry points require these dependencies.
Make sure that when updating app-sdk, you also install required peer dependencies based on your usage:

| Entry Point                                | Required Peer Dependencies                                              |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `@saleor/app-sdk/app-bridge`               | `react`, `react-dom`                                                    |
| `@saleor/app-sdk/app-bridge/next`          | `react`, `react-dom`, `next`                                            |
| `@saleor/app-sdk/handlers/next`            | `next`, `graphql`                                                       |
| `@saleor/app-sdk/handlers/next-app-router` | `next`, `graphql`                                                       |
| `@saleor/app-sdk/handlers/fetch-api`       | `graphql`                                                               |
| `@saleor/app-sdk/handlers/aws-lambda`      | `graphql`                                                               |
| `@saleor/app-sdk/settings-manager`         | -                                                                       |
| `@saleor/app-sdk/APL`                      | -                                                                       |
| `@saleor/app-sdk/APL/redis`                | `redis`                                                                 |
| `@saleor/app-sdk/APL/vercel-kv`            | `@vercel/kv`                                                            |
| `@saleor/app-sdk/APL/dynamodb`             | `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `dynamodb-toolbox` |
