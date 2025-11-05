import { describe, expect, it } from "vitest";

import { DashboardEventFactory } from "./events";

describe("DashboardEventFactory", () => {
  it("Creates handshake event", () => {
    expect(
      DashboardEventFactory.createHandshakeEvent("mock-token", 1, {
        dashboard: "3.15.3",
        core: "3.15.1",
      }),
    ).toEqual({
      payload: {
        token: "mock-token",
        version: 1,
        saleorVersion: "3.15.1",
        dashboardVersion: "3.15.3",
      },
      type: "handshake",
    });
  });

  it("Creates redirect event", () => {
    expect(DashboardEventFactory.createRedirectEvent("/new-path")).toEqual({
      payload: {
        path: "/new-path",
      },
      type: "redirect",
    });
  });

  it("Creates dispatch response event", () => {
    expect(DashboardEventFactory.createDispatchResponseEvent("123", true)).toEqual({
      payload: {
        actionId: "123",
        ok: true,
      },
      type: "response",
    });
  });

  it("Creates theme change event", () => {
    expect(DashboardEventFactory.createThemeChangeEvent("light")).toEqual({
      payload: {
        theme: "light",
      },
      type: "theme",
    });
  });

  it("Creates locale change event", () => {
    expect(DashboardEventFactory.createLocaleChangedEvent("it")).toEqual({
      payload: {
        locale: "it",
      },
      type: "localeChanged",
    });
  });

  it("Creates token refresh event", () => {
    expect(DashboardEventFactory.createTokenRefreshEvent("TOKEN")).toEqual({
      payload: {
        token: "TOKEN",
      },
      type: "tokenRefresh",
    });
  });

  it("Creates form payload event for product translation", () => {
    const formPayload = {
      form: "product-translate" as const,
      productId: "product-123",
      translationLanguage: "es",
      fields: {
        productName: {
          fieldName: "productName",
          originalValue: "Original Product",
          translatedValue: "Producto Original",
          currentValue: "Original Product",
          type: "short-text" as const,
        },
        productDescription: {
          fieldName: "productDescription",
          originalValue: "Original description",
          translatedValue: "Descripción original",
          currentValue: "Original description",
          type: "editorjs" as const,
        },
      },
    };

    expect(DashboardEventFactory.createFormEvent(formPayload)).toEqual({
      type: "formPayload",
      payload: formPayload,
    });
  });

  it("Creates form payload event with all translation field types", () => {
    const formPayload = {
      form: "product-translate" as const,
      productId: "product-456",
      translationLanguage: "fr",
      fields: {
        shortTextField: {
          fieldName: "shortTextField",
          originalValue: "Short text",
          translatedValue: "Texte court",
          currentValue: "Short text",
          type: "short-text" as const,
        },
        editorField: {
          fieldName: "editorField",
          originalValue: "{\"blocks\": []}",
          translatedValue: "{\"blocks\": []}",
          currentValue: "{\"blocks\": []}",
          type: "editorjs" as const,
        },
      },
    };

    const event = DashboardEventFactory.createFormEvent(formPayload);

    expect(event.type).toBe("formPayload");
    if (event.payload.form === "product-translate") {
      expect(event.payload.fields.shortTextField.type).toBe("short-text");
      expect(event.payload.fields.editorField.type).toBe("editorjs");
    }
  });
});
