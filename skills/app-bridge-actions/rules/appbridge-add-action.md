# Adding an App Bridge Action

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
