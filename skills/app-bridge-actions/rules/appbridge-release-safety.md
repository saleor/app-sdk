# Release Safety & Public API

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
