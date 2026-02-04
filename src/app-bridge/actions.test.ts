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

  describe("actions.FormPayloadUpdate", () => {
    it("Constructs action with \"formPayloadUpdate\" type, random id and payload for product translation", () => {
      const payload = {
        form: "product-translate" as const,
        fields: {
          productName: { value: "Updated Product Name" },
          productDescription: { value: "Updated Description" },
          seoName: { value: "Updated SEO Name" },
          seoDescription: {
            value: "Updated seo description",
          },
        },
      } as const;

      const action = actions.FormPayloadUpdate(payload);

      expect(action.type).toBe("formPayloadUpdate");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload).toEqual(expect.objectContaining(payload));
    });

    it("Constructs action with field value results", () => {
      const payload = {
        form: "product-translate" as const,
        fields: {
          productName: { value: "New Name" },
          productDescription: { value: "New Description" },
          seoName: { value: "New SEO" },
          seoDescription: { value: "New SEO Description" },
        },
      };

      const action = actions.FormPayloadUpdate(payload);

      expect(action.payload.form).toBe("product-translate");

      if (action.payload.form === "product-translate") {
        expect(action.payload.fields.productName).toEqual({ value: "New Name" });
        expect(action.payload.fields.productDescription).toEqual({ value: "New Description" });
      }
    });
  });

  describe("actions.PopupClose", () => {
    it("Constructs action with \"popupClose\" type and random actionId", () => {
      const action = actions.PopupClose();

      expect(action.type).toBe("popupClose");
      expect(action.payload.actionId).toEqual(expect.any(String));
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
