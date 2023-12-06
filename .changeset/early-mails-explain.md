---
"@saleor/app-sdk": patch
---

Removed OTEL attribute http.method. It eventually caused bad mapping in Datadog -> overwriting span name
