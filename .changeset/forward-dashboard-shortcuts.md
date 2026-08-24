---
"@saleor/app-sdk": minor
---

Forward Dashboard-owned keyboard shortcuts out of the app iframe so global handlers (e.g. Cmd+K) keep working while the app has focus.

**Public API**

- `shortcutsChanged` event — Dashboard → app, full-replace list of `{ id, key, metaKey?, ctrlKey?, altKey?, shiftKey? }`. Stored as the optional `appBridgeState.dashboardShortcuts` (always set by AppBridge, defaults to `[]`). Entries without a non-empty `id` and `key` are dropped with a warning.
- `new AppBridge({ forwardKeyboardShortcuts })` — default `true`. Pass `false` to disable, or `{ shouldForward(event) }` to claim a registered chord back for the app.
- `matchDashboardShortcut`, `createShortcutForwarder` — matcher and listener used internally; exported for tests and non-React hosts.
- `AppBridge.destroy()` — detaches the instance from the window: stops forwarding shortcuts, stops receiving Dashboard events, and drops all subscribers. Safe to call more than once.

`AppBridgeProvider` now destroys the AppBridge it created when it unmounts (an instance passed via `appBridgeInstance` is left alone, since the caller owns it). Without this, React StrictMode's double-mount left two live bridges on the same window and every shortcut and event was handled twice.

Forwarding is a no-op until the Dashboard advertises a registry, so older Dashboards are unchanged.

There is deliberately no `actions.TriggerShortcut(...)` helper. The `triggerShortcut` action is dispatched by AppBridge itself in response to a real keypress that matched the advertised registry, and its payload only describes that keypress — apps should not synthesize input on the user's behalf. A capability an app wants to invoke directly (e.g. opening the command palette) belongs behind its own action instead.

**Dashboard contract** (implement in the Dashboard repo alongside this release)

1. After `handshake`, `postMessage` to the app iframe:

   ```ts
   {
     type: "shortcutsChanged",
     payload: {
       shortcuts: [
         { id: "commandPalette.open", key: "k", metaKey: true },
         // Windows/Linux equivalent if you handle it separately:
         { id: "commandPalette.open", key: "k", ctrlKey: true },
       ],
     },
   }
   ```

   Full replace, not a delta. Send again when the owned set changes (route/context). Send `{ shortcuts: [] }` to revoke.

2. Handle `triggerShortcut` in `useAppActions`:

   - Look up `payload.shortcutId` and run that command.
   - Respond `{ type: "response", payload: { actionId, ok: true } }`.
   - Unknown ids: respond `ok: false` (do not stay silent — silence times out `dispatch` after 10s).

3. Move focus out of the iframe when the resulting UI opens (e.g. `.focus()` the command-palette input). Without this, subsequent typing stays in the app.

`key` is `KeyboardEvent.key`, matched case-insensitively. Modifier flags are exact: registering Cmd+K does not swallow Cmd+Shift+K.
