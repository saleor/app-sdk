---
"@saleor/app-sdk": minor
---

Add `actions.OpenPopup()` App Bridge action and an `identifier` field on manifest extensions.

Apps can dispatch `actions.OpenPopup({ extensionIdentifier, params })` to ask the Dashboard to open one of the same app's POPUP extensions ("full mode"), referenced by its app-defined `identifier`. Intended to be dispatched from a WIDGET extension to open a co-located POPUP extension. The optional `params` is an arbitrary JSON-serializable payload forwarded to the opened popup. It only has an effect on Dashboard versions that handle the `openPopup` action type.

Manifest extensions now accept an optional `identifier` field (unique per app), used to reference a specific extension - e.g. as the `extensionIdentifier` target of `actions.OpenPopup()`.
