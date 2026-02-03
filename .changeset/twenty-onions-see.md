---
"@saleor/app-sdk": patch
---

Added new action `popupClose` to AppBridge. Now app can request Dashboard to close the popup. If app was not mounted in popup, event will be ignored.
