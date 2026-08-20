---
"@saleor/app-sdk": minor
---

Added `actions.RedirectToApp({ appIdentifier, path })` App Bridge action. It asks the Dashboard to resolve the URL of another installed app (by its manifest identifier) and redirect to it, optionally appending `path`.
