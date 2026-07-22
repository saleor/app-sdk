---
"@saleor/app-sdk": minor
---

Add the `openPopup` App Bridge action, the `OpenPopupParams` codec, an `identifier` field on manifest extensions, and `appParams` on AppBridge state.

Apps can dispatch `actions.OpenPopup({ extensionIdentifier, params })` to ask the Dashboard to open one of the same app's POPUP extensions ("full mode"), referenced by its app-defined `identifier`. Intended to be dispatched from a WIDGET extension to open a co-located POPUP extension. The optional `params` (any JSON-serializable value) is base64-serialized into the wire payload so the Dashboard forwards it verbatim into the popup iframe URL. It only has an effect on Dashboard versions that handle the `openPopup` action type.

`OpenPopupParams` is a static encoder/decoder shared by the SDK and the Dashboard: `urlKey` (`"appParams"`), `maxParamsLength` (2048), `serialize(json)` (JSON → UTF-8 → base64, throws when over the cap) and `parse(value)` (base64 → JSON). When an app opened as a POPUP loads, AppBridge reads that param from its iframe URL, decodes it and exposes it as `appBridge.getState().appParams` (`undefined` when absent or malformed).

Manifest extensions now accept an optional `identifier` field (unique per app), used to reference a specific extension - e.g. as the `extensionIdentifier` target of `actions.OpenPopup()`.
