---
"@saleor/app-sdk": minor
---

Added "SEARCH_ACTION" mount point for Extensions to Manifest types. It surfaces app actions in the dashboard command palette (Cmd+K), supports `POPUP`, `APP_PAGE` and `NEW_TAB` targets (not `WIDGET`), and can be scoped to specific dashboard views via the new `options.views` field (typed by the new `AppExtensionView` union).
