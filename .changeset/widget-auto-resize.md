---
"@saleor/app-sdk": minor
---

Add widget auto-resize helpers for detail-page sidebar extensions.

Apps mounted as `*_DETAILS_WIDGETS` can attach `useWidgetAutoResize(rootRef)` (or call `postWidgetHeight(appBridge, root)`) so the Dashboard iframe follows a widget root element's height instead of staying in a fixed box. Height is reported through the standard App Bridge channel via the new `actions.WidgetResize({ height })` action — the same way every other Dashboard command is dispatched. Existing apps that do not adopt the hook keep the previous default height.
