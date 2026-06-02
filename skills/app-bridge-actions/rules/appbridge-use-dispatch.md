# Use dispatch, not manual postMessage

The app talks to the Dashboard through **exactly one** channel: an `actions.*` action sent via
`appBridge.dispatch()`. Never call `window.parent.postMessage` directly or add a second message
protocol.

> **Source**: `src/app-bridge/app-bridge.ts` (`AppBridge.dispatch`), `src/app-bridge/actions.ts`

## The Smell

A raw `window.parent.postMessage(...)` from the SDK, or a new `"saleor:foo"` message constant, is
what this rule exists to stop.

```ts
// ❌ parallel protocol
export const FOO_MESSAGE = "saleor:foo";
window.parent.postMessage({ type: FOO_MESSAGE, value }, "*");

// ✅ one channel
appBridge.dispatch(actions.Foo({ value }));
```

## Why

- One mental model for app authors: `import { actions }` → `dispatch`.
- One greppable, documented surface instead of scattered message strings.
- `dispatch` already gives `actionId` correlation and a Dashboard `ok`/error response.
- The Dashboard listens in one place; a second protocol needs a second listener and its own versioning.

## Helpers and Hooks Wrap Dispatch

Ship ergonomic helpers, but they take an `AppBridge` instance (or pull one from `useAppBridge()`)
and dispatch internally. App authors should never touch raw `postMessage` or import a message
constant.

```ts
export const reportWidgetHeight = (appBridge: AppBridge, height: number): void => {
  if (SSR || !isPositiveFiniteHeight(height)) return;
  // Best-effort: never let a failed/timed-out dispatch break the app.
  appBridge.dispatch(actions.WidgetResize({ height })).catch(() => {});
};
```

## Dispatch Rejects — Always Catch

`dispatch()` returns a promise that **rejects on negative status or after the 10s timeout**, so an
un-caught dispatch can surface as an unhandled rejection. For best-effort commands (resize, route
propagation) you don't need the result: dispatch without `await` and attach a `.catch`. Existing
fire-and-forget call sites (`useRoutePropagator`, `sendNotifyReadyAction`) log in the catch:

```ts
appBridge.dispatch(actions.UpdateRouting({ newRoute })).catch(() => {
  console.error("Error dispatching action");
});
```

For a **high-frequency** signal like resize, a silent `.catch(() => {})` is a deliberate exception:
a Dashboard with no handler for the action sends no response, so every report rejects after the 10s
timeout, and resize can fire repeatedly as content changes — logging each rejection would be noisy.
Pick logging by default; choose silent only when failures are expected and frequent.

## Anti-patterns

❌ **Don't call `window.parent.postMessage` from the SDK** — Dispatch an action instead
❌ **Don't export a `*_MESSAGE` constant for a new command** — The action `type` is the contract
❌ **Don't make app authors construct the message envelope** — Provide an `actions.*` creator
❌ **Don't leave a best-effort dispatch un-caught** — It rejects on timeout/negative; attach a `.catch`
