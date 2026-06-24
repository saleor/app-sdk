---
"@saleor/app-sdk": minor
---

Add `OpenPopupParams` and expose decoded popup params on AppBridge state.

`OpenPopupParams` is a shared encoder/decoder for the JSON payload passed with the `openPopup` App Bridge action. It exposes `urlKey` (`"appParams"`), `serialize(json)` (JSON → UTF-8 → base64, used by the Dashboard) and `parse(value)` (base64 → JSON, used by the app).

When an app opened as a POPUP loads, AppBridge now reads that param from its iframe URL, decodes it and exposes it as `appBridge.getState().appParams` (`undefined` when absent or malformed).
