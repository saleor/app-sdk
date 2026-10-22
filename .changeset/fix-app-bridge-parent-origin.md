---
"@saleor/app-sdk": patch
---

Fixed App Bridge rejecting Dashboard messages after a full-page navigation inside an app iframe. The bridge now uses the browser-reported immediate parent origin when available, so navigating and then reloading the iframe can reconnect to the Dashboard even when the document referrer points to the app itself. Browsers without ancestor origin information retain the existing referrer fallback.
