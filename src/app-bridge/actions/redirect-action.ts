import { ActionWithId, withActionId } from "./actions-utils";

/**
 * Ask Dashboard to redirect - either internal or external route
 */
export const REDIRECT_ACTION_TYPE = "redirect";

export type RedirectPayload = {
  /**
   * Relative (inside Dashboard) or absolute URL path.
   */
  to: string;
  newContext?: boolean;
};
/**
 * Redirects Dashboard user.
 */
export type RedirectAction = ActionWithId<typeof REDIRECT_ACTION_TYPE, RedirectPayload>;

export function createRedirectAction(payload: RedirectPayload): RedirectAction {
  return withActionId({
    payload,
    type: REDIRECT_ACTION_TYPE,
  });
}
