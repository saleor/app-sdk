# App Bridge Actions Skill

Repo-local agent skill for `@saleor/app-sdk`. Teaches agents to extend the app-to-Dashboard
communication layer the right way: one channel — `actions.*` + `appBridge.dispatch()` — instead of a
second `postMessage` protocol.

## What's Included

3 rules in 1 category:

| Category   | Rules                                                                        | Topics                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App Bridge | `appbridge-use-dispatch`, `appbridge-add-action`, `appbridge-release-safety` | Use dispatch not manual postMessage, helpers/hooks wrap dispatch, fire-and-forget; recipe for adding an action; public-API / breaking-change checklist |

## Structure

```
app-bridge-actions/
├── SKILL.md                          # Overview and quick reference (agents read this first)
├── AGENTS.md                         # Full compiled document (all rules expanded)
├── README.md                         # This file (for humans)
└── rules/                            # Individual rule files
    ├── appbridge-use-dispatch.md
    ├── appbridge-add-action.md
    └── appbridge-release-safety.md
```

## Who Is This For?

- **AI agents** working in the `app-sdk` repo, especially in `src/app-bridge/`
- **Contributors** adding a new Dashboard command, iframe sizing, or a `postMessage` helper

This skill follows the [Agent Skills Specification](https://agentskills.io) so it is portable across
tools, not Cursor-specific.

## License

MIT
