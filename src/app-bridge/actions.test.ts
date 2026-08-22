import { afterEach, describe, expect, it, vi } from "vitest";

import { actions, NotificationPayload, RedirectPayload } from "./actions";
import { OpenPopupParams } from "./open-popup-params";

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
        },
      };

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

      expect(action.payload.fields.productName).toEqual({ value: "New Name" });
      expect(action.payload.fields.productDescription).toEqual({ value: "New Description" });
    });
  });

  describe("actions.PopupClose", () => {
    it("Constructs action with \"popupClose\" type and random actionId", () => {
      const action = actions.PopupClose();

      expect(action.type).toBe("popupClose");
      expect(action.payload.actionId).toEqual(expect.any(String));
    });
  });

  describe("actions.WidgetResize", () => {
    it("Constructs action with \"widgetResize\" type, random actionId and height payload", () => {
      const action = actions.WidgetResize({ height: 240 });

      expect(action.type).toBe("widgetResize");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload.height).toBe(240);
    });

    it.each([
      { height: 0, label: "zero" },
      { height: -10, label: "negative" },
      { height: Number.NaN, label: "NaN" },
      { height: Number.POSITIVE_INFINITY, label: "Infinity" },
    ])("throws when height is $label", ({ height }) => {
      expect(() => actions.WidgetResize({ height })).toThrow(
        "WidgetResize height must be a positive, finite number.",
      );
    });

    it("throws when height is not a number", () => {
      expect(() => actions.WidgetResize({ height: "foo" as unknown as number })).toThrow(
        "WidgetResize height must be a positive, finite number.",
      );
    });
  });

  describe("actions.RefreshEntity", () => {
    it("Constructs action with \"refreshEntity\" type and random actionId", () => {
      const action = actions.RefreshEntity();

      expect(action.type).toBe("refreshEntity");
      expect(action.payload.actionId).toEqual(expect.any(String));
    });
  });

  describe("actions.OpenPopup", () => {
    it("Constructs action with \"openPopup\" type, random actionId and base64 appParams", () => {
      const params = { mode: "full", nested: { id: 1 } };

      const action = actions.OpenPopup({ extensionIdentifier: "main-popup", params });

      expect(action.type).toBe("openPopup");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload.extensionIdentifier).toBe("main-popup");
      // params are serialized here so the Dashboard forwards them verbatim
      expect(action.payload.appParams).toBe(OpenPopupParams.serialize(params));
      expect(OpenPopupParams.parse(action.payload.appParams!)).toEqual(params);
    });

    it("Constructs action without params", () => {
      const action = actions.OpenPopup({ extensionIdentifier: "main-popup" });

      expect(action.type).toBe("openPopup");
      expect(action.payload.extensionIdentifier).toBe("main-popup");
      expect(action.payload.appParams).toBeUndefined();
    });

    it.each([
      { extensionIdentifier: "", label: "empty" },
      { extensionIdentifier: "   ", label: "whitespace" },
      { extensionIdentifier: undefined as unknown as string, label: "missing" },
      { extensionIdentifier: 123 as unknown as string, label: "non-string" },
    ])("throws when extensionIdentifier is $label", ({ extensionIdentifier }) => {
      expect(() => actions.OpenPopup({ extensionIdentifier })).toThrow(
        "OpenPopup extensionIdentifier must be a non-empty string.",
      );
    });
  });

  describe("actions.TriggerShortcut", () => {
    it("Constructs action with \"triggerShortcut\" type, random actionId and payload", () => {
      const payload = {
        shortcutId: "commandPalette.open",
        key: "k",
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      };

      const action = actions.TriggerShortcut(payload);

      expect(action.type).toBe("triggerShortcut");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload).toEqual(expect.objectContaining(payload));
    });

    it.each([
      { shortcutId: "", label: "empty" },
      { shortcutId: "   ", label: "whitespace" },
      { shortcutId: undefined as unknown as string, label: "missing" },
    ])("throws when shortcutId is $label", ({ shortcutId }) => {
      expect(() =>
        actions.TriggerShortcut({
          shortcutId,
          key: "k",
          metaKey: true,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
        }),
      ).toThrow("TriggerShortcut shortcutId must be a non-empty string.");
    });

    it.each([
      { key: "", label: "empty" },
      { key: "   ", label: "whitespace" },
    ])("throws when key is $label", ({ key }) => {
      expect(() =>
        actions.TriggerShortcut({
          shortcutId: "commandPalette.open",
          key,
          metaKey: true,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
        }),
      ).toThrow("TriggerShortcut key must be a non-empty string.");
    });
  });

  describe("actions.RedirectToApp", () => {
    it("Constructs action with \"redirectToApp\" type, random actionId and payload", () => {
      const action = actions.RedirectToApp({ appIdentifier: "other-app", path: "/orders/1" });

      expect(action.type).toBe("redirectToApp");
      expect(action.payload.actionId).toEqual(expect.any(String));
      expect(action.payload.appIdentifier).toBe("other-app");
      expect(action.payload.path).toBe("/orders/1");
    });

    it("Constructs action without path", () => {
      const action = actions.RedirectToApp({ appIdentifier: "other-app" });

      expect(action.payload.appIdentifier).toBe("other-app");
      expect(action.payload.path).toBeUndefined();
    });

    it.each([
      { appIdentifier: "", label: "empty" },
      { appIdentifier: "   ", label: "whitespace" },
      { appIdentifier: undefined as unknown as string, label: "missing" },
      { appIdentifier: 123 as unknown as string, label: "non-string" },
    ])("throws when appIdentifier is $label", ({ appIdentifier }) => {
      expect(() => actions.RedirectToApp({ appIdentifier })).toThrow(
        "RedirectToApp appIdentifier must be a non-empty string.",
      );
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
    ).throws(
      "Failed to generate action ID, likely as your browser doesn't consider current session as Secure Context. Please ensure you are using https or localhost, or current IP/domain is in 'dom.securecontext.allowlist'/'#unsafely-treat-insecure-origin-as-secure' if you trust it.",
    );
  });
});
