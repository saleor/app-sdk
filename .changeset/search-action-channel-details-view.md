---
"@saleor/app-sdk": minor
---

Added `CHANNEL_DETAILS` to `AppExtensionView`, so a `SEARCH_ACTION` extension can be scoped to the channel details page with `options.views: ["CHANNEL_DETAILS"]`. The extension is opened with `channelId` holding the channel's global id.
