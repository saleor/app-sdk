---
"@saleor/app-sdk": minor
---

EnvAPL can now cache JWKS. While other values are read-only by design (read system values), JWKS is used by SDK to verify JWT tokens. Other APLs store cached JWKS to AuthData to reduce number of requests to Saleor (and essentially make everything faster). Now EnvAPL will try to cache in memory. In server environment, this should preserve full TTL (default 5 minutes, configurable in constructor). In serverless, if new lambda is spawned, cache will behave like it was just not set.
