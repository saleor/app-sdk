# App Bridge Actions

**Version 1.0.0**  
Saleor  
June 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when adding or changing  
> app-to-Dashboard communication in `@saleor/app-sdk`. Humans may also find it  
> useful, but guidance here is optimized for AI-assisted workflows.

---

## Abstract

Guide for extending the App Bridge communication layer in `@saleor/app-sdk`. The app, running inside
the Saleor Dashboard iframe, sends commands through exactly one channel: an `actions.*` action sent
via `appBridge.dispatch()`. This document explains how to add a new action, how to wrap it in helpers
and hooks, and how to ship it without breaking the public API. Contains 3 rules in 1 category.

**Why it exists:** apps are third-party web apps embedded via a cross-origin `<iframe>`, so the
browser's only sanctioned transport is `window.postMessage`. App Bridge is the typed wrapper over
that single link — app → Dashboard = actions (`dispatch`), Dashboard → app = events (`subscribe`).
There is one physical pipe, so a second message protocol is just an ungoverned use of it; every
command must be an action.

---

## Table of Contents

1. [App Bridge](#1-app-bridge) — **CRITICAL**
   - 1.1 [Use dispatch, not manual postMessage](#11-use-dispatch-not-manual-postmessage)
   - 1.2 [Adding an App Bridge Action](#12-adding-an-app-bridge-action)
   - 1.3 [Release Safety & Public API](#13-release-safety--public-api)

---

## 1. App Bridge

**Impact: CRITICAL**

App Bridge is the contract between an app and the Saleor Dashboard. Getting it wrong fragments the
protocol, confuses app authors, and creates breaking changes that ripple across the SDK, the
Dashboard, and every installed app.

### 1.1 Use dispatch, not manual postMessage

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

### 1.2 Adding an App Bridge Action

All edits live in `src/app-bridge/actions.ts` (plus a test and a changeset). Copy an existing action
(`WidgetResize`, `PopupClose`) — don't invent a new shape.

> **Source**: `src/app-bridge/actions.ts`, `src/app-bridge/actions.test.ts`

## Recipe

```ts
// 1. ActionType string — camelCase, with JSDoc + the Saleor version it needs
widgetResize: "widgetResize",

// 2. Payload type
export type WidgetResizePayload = { height: number };

// 3. Action type
export type WidgetResize = ActionWithId<"widgetResize", WidgetResizePayload>;

// 4. Creator — withActionId injects a crypto.randomUUID() actionId. Never hand-roll the envelope.
function createWidgetResizeAction(payload: WidgetResizePayload): WidgetResize {
  return withActionId({ type: "widgetResize", payload });
}

// 5. Register in the union and the map
export type Actions = /* ... */ | WidgetResize;
export const actions = { /* ... */ WidgetResize: createWidgetResizeAction };
```

Then add a case to `actions.test.ts` asserting `type`, `actionId`, and the payload.

## Dispatch Owns the Envelope

`AppBridge.dispatch` posts `{ type, payload }` to `window.parent`, then awaits an
`EventType.response` whose `actionId` matches `payload.actionId` (10s timeout, rejects on `ok: false`).
You only define the action; do not re-implement posting or response matching.

## Anti-patterns

❌ **Don't add a `type` that isn't in `ActionType`** — Keep the source of truth in one enum-like object  
❌ **Don't generate `actionId` yourself** — Use `withActionId`  
❌ **Don't skip registering in `Actions`** — The union types `dispatch`'s argument  
❌ **Don't forget the `actions.test.ts` case** — Every action has one

### 1.3 Release Safety & Public API

The action `type` strings, the message wire format, exported constants, and helper/hook signatures
are all **public API**. Treat changes to them as you would any breaking change.

> **Source**: `src/app-bridge/index.ts`, `.changeset/`, `saleor-docs` App Bridge page

## Before Merging

- [ ] Fix wire-format / constant mistakes **before** the first release (otherwise it's breaking later).
- [ ] Land the Dashboard handler for the new `type` (responding `ok: true`) in the same change; gate with a version note.
- [ ] Add a changeset describing the new `actions.Xxx(...)` and any helper.
- [ ] Remove now-unused exports (constants, interfaces) from `index.ts` and update all tests.
- [ ] Update the actions table in `saleor-docs` — describe it as an action, not as a separate protocol.

## Version Gating

App and Dashboard ship separately, and a new action does nothing until the Dashboard handles its
`type` — `useAppActions` routes unknown types to a `default` branch that sends no response and logs
an "unknown action" warning. Note the minimum Dashboard version in the action's JSDoc and docs.

## Origin

Widget auto-resize first shipped (unreleased) as a separate `saleor:widget:resize` `postMessage`
with an exported `WIDGET_RESIZE_MESSAGE` constant and docs saying "do not call dispatch for sizing."
Review flagged it as a parallel protocol and a future breaking change. It was reworked into
`actions.WidgetResize({ height })` dispatched like every other command, with helpers/hook wrapping
`dispatch`. This skill exists so the next App Bridge feature starts as an action.

## Anti-patterns

❌ **Don't treat the message `type` as private** — Renaming it breaks apps and the Dashboard  
❌ **Don't merge the SDK side without the Dashboard handler** — Coordinate both  
❌ **Don't skip the changeset** — Every public change needs one  
❌ **Don't leave dead exports in `index.ts`** — They become permanent API

---

## References

1. [Saleor App SDK](https://github.com/saleor/app-sdk)
2. [App Bridge docs](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/app-bridge)
3. [Agent Skills Specification](https://agentskills.io)
