import type { ActionType } from "./actions";

export type Action<Name extends ActionType, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

export type ActionWithId<Name extends ActionType, Payload extends {}> = {
  payload: Payload & { actionId: string };
  type: Name;
};

/**
 * Stamp an action with the `actionId` the Dashboard echoes back in its
 * `response` event, which is how `dispatch` resolves the right promise.
 *
 * Lives in its own module (rather than in `actions.ts`) so action factories that
 * are deliberately kept out of the public `actions` object can still build a
 * well-formed envelope. `index.ts` does `export * from "./actions"`, so anything
 * exported from there is public API; this module is not re-exported.
 */
export function withActionId<
  Name extends ActionType,
  Payload extends {},
  T extends Action<Name, Payload>,
>(action: T): ActionWithId<Name, Payload> {
  try {
    const actionId = globalThis.crypto.randomUUID();

    return {
      ...action,
      payload: {
        ...action.payload,
        actionId,
      },
    };
  } catch (e) {
    throw new Error(
      "Failed to generate action ID, likely as your browser doesn't consider current session as Secure Context. Please ensure you are using https or localhost, or current IP/domain is in 'dom.securecontext.allowlist'/'#unsafely-treat-insecure-origin-as-secure' if you trust it.",
    );
  }
}
