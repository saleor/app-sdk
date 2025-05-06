import { afterEach, describe, expect, it, vi } from "vitest";

import { actions, NotificationPayload, RedirectPayload } from "./actions";

describe("actions.ts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("actions.Notification", () => {
    it("Constructs action with \"notification\" type, random id and payload", () => {
      const payload: NotificationPayload = {
        apiMessage: "test-api-message",
        status: "info",
        text: "test-text",
        title: "test-title",
      };

      const action = actions.Notification(payload);

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

      const action = actions.Redirect(payload);

      expect(action.type).toBe("redirect");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload).toEqual(expect.objectContaining(payload));
    });
  });

  it("Throws custom error if crypto is not available", () => {
    vi.stubGlobal("crypto", {
      ...globalThis.crypto,
      randomUUID: undefined,
    });

    return expect(() =>
      actions.Notification({
        title: "Test",
      }),
    ).throws("Failed to generate action ID. Please ensure you are using https or localhost");
  });
});
