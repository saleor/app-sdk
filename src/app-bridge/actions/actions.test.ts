import { describe, expect, it } from "vitest";

import { Action } from "./actions";
import { NotificationPayload } from "./notification-action";
import { RedirectPayload } from "./redirect-action";

describe("actions.ts", () => {
  describe("actions.Notification", () => {
    it("Constructs action with \"notification\" type, random id and payload", () => {
      const payload: NotificationPayload = {
        apiMessage: "test-api-message",
        status: "info",
        text: "test-text",
        title: "test-title",
      };

      const action = Action.Notification(payload);

      expect(action.type).toBe("notification");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload).toEqual(expect.objectContaining(payload));
    });
  });

  describe("actions.Redirect", () => {
    it("Constructs action with \"redirect\" type, random id and payload", () => {
      const payload: RedirectPayload = {
        newContext: true,
        to: "/foo/bar",
      };

      const action = Action.Redirect(payload);

      expect(action.type).toBe("redirect");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload).toEqual(expect.objectContaining(payload));
    });
  });
});
