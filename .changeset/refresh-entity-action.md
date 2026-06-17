---
"@saleor/app-sdk": minor
---

Add `actions.RefreshEntity()` App Bridge action.

Apps can dispatch `actions.RefreshEntity()` to ask the Dashboard to refresh the entity active in the current context, e.g. the currently open Order or Product. The action takes no payload. It only has an effect on Dashboard versions that handle the `refreshEntity` action type.
