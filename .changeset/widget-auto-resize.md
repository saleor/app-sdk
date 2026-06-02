---
"@saleor/app-sdk": minor
---

Add widget auto-resize for detail-page sidebar extensions (`*_DETAILS_WIDGETS`).

**Public API:** `useWidgetAutoResize(rootRef, enabled?)`, `actions.WidgetResize({ height })`, `reportWidgetHeight(appBridge, height)`, `reportWidgetHeightFromElement(appBridge, root)`.

Height is reported via the `widgetResize` App Bridge action. Existing apps that omit the hook keep the previous default iframe height.
