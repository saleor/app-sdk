---
"@saleor/app-sdk": minor
---

Added OTEL spans around Saleor Cloud APL - GET and POST methods.
Now, if app is instrumented with OpenTelemetry, app-sdk will show spans for these remote calls.
