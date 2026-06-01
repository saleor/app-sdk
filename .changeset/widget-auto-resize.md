---
"@saleor/app-sdk": minor
---

Add widget auto-resize helpers for detail-page sidebar extensions.

Apps mounted as `*_DETAILS_WIDGETS` can attach `useWidgetAutoResize(rootRef)` (or call `postWidgetHeight()`) so the Dashboard iframe follows a widget root element's height instead of staying in a fixed box. Existing apps that do not adopt the hook keep the previous default height.
