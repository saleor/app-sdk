---
"@saleor/app-sdk": major
---

`createManifestHandler` will now require `saleor-schema-version` header, sent by Saleor when fetching manifest.
`schemaVersion` parameter passed to factory method will be always defined

### Previously:

```ts
const handler = createManifestHandler({
  manifestFactory({ schemaVersion }) {
    schemaVersion -> null or number
    return {
      // ...
    }
  }
})
```

Example request:

```http
GET /api/manifest
host: my-app.com
```

```http
GET /api/manifest
host: my-app.com
saleor-schema-version: 3.20
```

Example response:

```http
Content-Type: application/json

{
  "name": "Example Saleor App"
  ...
}
```

### Now:

```ts
const handler = createManifestHandler({
  manifestFactory({ schemaVersion }) {
    schemaVersion -> number
    return {
      // ...
    }
  }
})
```

### Invalid request

```http
GET /api/manifest
host: my-app.com
```

Response:

```http
HTTP 400
Content-Type: text/plain

Missing schema version header
```

### Valid request

```http
GET /api/manifest
host: my-app.com
saleor-schema-version: 3.20
```

Response:

```http
HTTP 200
Content-Type: application/json

{
  "name": "Example Saleor App"
  ...
}
```
