---
"@saleor/app-sdk": minor
---

Changed behavior or Saleor Cloud APL - get method. Prevoiusly ANY error was catched and method returned "undefined". Now only 404-like errors will return "undefined" and error like 5xx, timeouts, wrong body, etc. will result with thrown error. This is technically a breaking change on function level, but in the end app will fail anyway - if APL is not found, it can't proceed. Now error is thrown earlier. It should help with debugging and better custom error handling.
