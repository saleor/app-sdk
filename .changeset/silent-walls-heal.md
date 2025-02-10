---
"@saleor/app-sdk": major
---

`createManifestHandler` will now require `saleor-schema-version` header, sent by Saleor when fetching manifest.
`schemaVersion` parameter passed to factory method will be always defined

### Previously:

```
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

```
GET /api/manifest
host: my-app.com
```

```
GET /api/manifest
host: my-app.com
saleor-schema-version: 3.20
```

Example response:

```
Content-Type: application/json

{
  "name": "Example Saleor App"
  ...
}
```

### Now:

```
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

```
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

```
HTTP 200
Content-Type: application/json

{
  "name": "Example Saleor App"
  ...
}
```
