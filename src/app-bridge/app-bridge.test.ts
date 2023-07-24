import { fireEvent } from "@testing-library/dom";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleCode } from "../locales";
// eslint-disable-next-line
import {
  actions,
  ActionType,
  AppBridge,
  DashboardEventFactory,
  DispatchResponseEvent,
  HandshakeEvent,
  ThemeEvent,
} from ".";

// mock document.referrer
const origin = "http://example.com";
const domain = "saleor.domain.host";
const validJwtToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6Ijk4ZTEzNDk4YmM5NThjM2QyNzk2NjY5Zjk0NzYxMzZkIn0.eyJpYXQiOjE2NjkxOTE4NDUsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiZGVtby5ldS5zYWxlb3IuY2xvdWQiLCJleHAiOjE2NjkyNzgyNDUsInRva2VuIjoic2JsRmVrWnVCSUdXIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInR5cGUiOiJ0aGlyZHBhcnR5IiwidXNlcl9pZCI6IlZYTmxjam95TWc9PSIsImlzX3N0YWZmIjp0cnVlLCJhcHAiOiJRWEJ3T2pJM05RPT0iLCJwZXJtaXNzaW9ucyI6W10sInVzZXJfcGVybWlzc2lvbnMiOlsiTUFOQUdFX1BBR0VfVFlQRVNfQU5EX0FUVFJJQlVURVMiLCJNQU5BR0VfUFJPRFVDVF9UWVBFU19BTkRfQVRUUklCVVRFUyIsIk1BTkFHRV9ESVNDT1VOVFMiLCJNQU5BR0VfUExVR0lOUyIsIk1BTkFHRV9TVEFGRiIsIk1BTkFHRV9QUk9EVUNUUyIsIk1BTkFHRV9TSElQUElORyIsIk1BTkFHRV9UUkFOU0xBVElPTlMiLCJNQU5BR0VfT0JTRVJWQUJJTElUWSIsIk1BTkFHRV9VU0VSUyIsIk1BTkFHRV9BUFBTIiwiTUFOQUdFX0NIQU5ORUxTIiwiTUFOQUdFX0dJRlRfQ0FSRCIsIkhBTkRMRV9QQVlNRU5UUyIsIklNUEVSU09OQVRFX1VTRVIiLCJNQU5BR0VfU0VUVElOR1MiLCJNQU5BR0VfUEFHRVMiLCJNQU5BR0VfTUVOVVMiLCJNQU5BR0VfQ0hFQ0tPVVRTIiwiSEFORExFX0NIRUNLT1VUUyIsIk1BTkFHRV9PUkRFUlMiXX0.PUyvuUlDvUBXMGSaexusdlkY5wF83M8tsjefVXOknaKuVgLbafvLOgx78YGVB4kdAybC7O3Yjs7IIFOzz5U80Q";

const validTokenWithAppPermissions =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE2ODk4NTIyOTEsIm93bmVyIjoic2FsZW9yIiwiaXNzIjoiaHR0cHM6Ly9oYWNrYXRob24tc2hpcHBpbmcuZXUuc2FsZW9yLmNsb3VkL2dyYXBocWwvIiwiZXhwIjoxNjg5OTM4NjkxLCJ0b2tlbiI6IjNHTWRUSVpab3FRSSIsImVtYWlsIjoibHVrYXN6Lm9zdHJvd3NraUBzYWxlb3IuaW8iLCJ0eXBlIjoidGhpcmRwYXJ0eSIsInVzZXJfaWQiOiJWWE5sY2pveU1nPT0iLCJpc19zdGFmZiI6dHJ1ZSwiYXBwIjoiUVhCd09qSXdNalE9IiwicGVybWlzc2lvbnMiOlsiTUFOQUdFX09SREVSUyIsIkhBTkRMRV9UQVhFUyIsIk1BTkFHRV9DSEFOTkVMUyJdLCJ1c2VyX3Blcm1pc3Npb25zIjpbIk1BTkFHRV9VU0VSUyIsIk1BTkFHRV9TRVRUSU5HUyIsIkhBTkRMRV9UQVhFUyIsIk1BTkFHRV9QQUdFUyIsIkhBTkRMRV9DSEVDS09VVFMiLCJNQU5BR0VfTUVOVVMiLCJNQU5BR0VfVFJBTlNMQVRJT05TIiwiTUFOQUdFX1BST0RVQ1RTIiwiTUFOQUdFX1RBWEVTIiwiTUFOQUdFX09CU0VSVkFCSUxJVFkiLCJNQU5BR0VfT1JERVJTX0lNUE9SVCIsIk1BTkFHRV9DSEFOTkVMUyIsIk1BTkFHRV9BUFBTIiwiSU1QRVJTT05BVEVfVVNFUiIsIk1BTkFHRV9QUk9EVUNUX1RZUEVTX0FORF9BVFRSSUJVVEVTIiwiSEFORExFX1BBWU1FTlRTIiwiTUFOQUdFX0NIRUNLT1VUUyIsIk1BTkFHRV9HSUZUX0NBUkQiLCJNQU5BR0VfU0hJUFBJTkciLCJNQU5BR0VfU1RBRkYiLCJNQU5BR0VfRElTQ09VTlRTIiwiTUFOQUdFX1BMVUdJTlMiLCJNQU5BR0VfT1JERVJTIiwiTUFOQUdFX1BBR0VfVFlQRVNfQU5EX0FUVFJJQlVURVMiXX0.zGglCWxuOBgGJKyyZ-6m9Th4_tGUMCMjF6W3UQhaTl5P_tQ2694Pcjwnr2zDzeF0Hl4J-gPWlyH4fLnfHIaJpDds9POtZv1D-bE5kChtkcUC1hfBUzb7iL8SwtQhtvSWy-XmsVDpQTMeD7q5McRSaKNPf3IzPXPJx-F_y5OGpgTukXoweVOufG7jcyrKWyePTqJn1evQTawQOYlzp3nj22uE4sn4UQvpbPgHIbcPohoJSdKigwAPaUqTIz_q8Mrpn4EBUezrs0_24E49kILt4K6Otupbba7rJxQe5664-o7FnSunp-2gtr6zdUaY5hV3bR84WjQZFtgCOgPVd_YT9Q";

Object.defineProperty(window.document, "referrer", {
  value: origin,
  writable: true,
});

Object.defineProperty(window, "location", {
  value: {
    href: `${origin}?domain=${domain}&id=appid`,
  },
  writable: true,
});

const handshakeEvent: HandshakeEvent = {
  payload: {
    token: validJwtToken,
    version: 1,
  },
  type: "handshake",
};

const themeEvent: ThemeEvent = {
  type: "theme",
  payload: {
    theme: "light",
  },
};

const delay = (timeout: number) =>
  new Promise((res) => {
    setTimeout(res, timeout);
  });

const mockDashboardActionResponse = (actionType: ActionType, actionID: string) => {
  function onMessage(event: MessageEvent) {
    if (event.data.type === actionType) {
      fireEvent(
        window,
        new MessageEvent("message", {
          data: {
            type: "response",
            payload: { ok: true, actionId: actionID },
          } as DispatchResponseEvent,
          origin,
        })
      );
    }
  }

  window.addEventListener("message", onMessage);

  return function cleanup() {
    window.removeEventListener("message", onMessage);
  };
};

describe("AppBridge", () => {
  let appBridge = new AppBridge();

  beforeEach(() => {
    appBridge = new AppBridge();

    vi.spyOn(console, "warn").mockImplementation(() => {
      // noop
    });

    vi.spyOn(console, "error").mockImplementation(() => {
      // noop
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("correctly sets the default domain, if not set in constructor", () => {
    expect(appBridge.getState().domain).toEqual(domain);
  });

  it("authenticates", () => {
    expect(appBridge.getState().ready).toBe(false);

    const token = validTokenWithAppPermissions;
    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload: { token } },
        origin,
      })
    );

    expect(appBridge.getState().ready).toBe(true);
    expect(appBridge.getState().token).toEqual(token);
    expect(appBridge.getState().appPermissions).toEqual([
      "MANAGE_ORDERS",
      "HANDLE_TAXES",
      "MANAGE_CHANNELS",
    ]);
  });

  it("subscribes to an event and returns unsubscribe function", () => {
    const callback = vi.fn();
    const unsubscribe = appBridge.subscribe("handshake", callback);

    expect(callback).not.toHaveBeenCalled();

    const token = validJwtToken;

    // First call proper event
    fireEvent(
      window,
      new MessageEvent("message", {
        data: handshakeEvent,
        origin,
      })
    );

    // incorrect event type
    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "invalid", payload: { token: "invalid" } },
        origin,
      })
    );

    // incorrect origin
    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload: { token } },
        origin: "http://wrong.origin.com",
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(handshakeEvent.payload);
    expect(appBridge.getState().token).toEqual(handshakeEvent.payload.token);
    expect(appBridge.getState().id).toEqual("appid");

    unsubscribe();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload: { token: validJwtToken } },
        origin,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(appBridge.getState().token).toEqual(validJwtToken);
  });

  it("Subscribes to theme change event and runs callback with new value after delay", async () => {
    expect.assertions(2);
    const callback = vi.fn();

    const unsubscribe = appBridge.subscribe("theme", callback);

    await delay(200);

    fireEvent(
      window,
      new MessageEvent("message", {
        data: themeEvent,
        origin,
      })
    );

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith({ theme: "light" });

    unsubscribe();
  });

  it("persists domain", () => {
    expect(appBridge.getState().domain).toEqual(domain);
  });

  it("dispatches valid action", () => {
    const target = "/test";
    const action = actions.Redirect({ to: target });

    mockDashboardActionResponse(action.type, action.payload.actionId);

    return expect(appBridge.dispatch(action)).resolves.toBeUndefined();
  });

  it("times out after action response has not been registered", () =>
    expect(appBridge.dispatch(actions.Redirect({ to: "/test" }))).rejects.toBeInstanceOf(Error));

  it("unsubscribes from all listeners", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    appBridge.subscribe("handshake", cb1);
    appBridge.subscribe("handshake", cb2);

    fireEvent(
      window,
      new MessageEvent("message", {
        data: handshakeEvent,
        origin,
      })
    );

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    appBridge.unsubscribeAll();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: handshakeEvent,
        origin,
      })
    );

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it("attaches domain from options in constructor", () => {
    appBridge = new AppBridge({
      targetDomain: "https://foo.bar",
    });

    expect(appBridge.getState().domain).toEqual("https://foo.bar");
  });

  it.each<LocaleCode>(["pl", "en", "it"])("sets initial locale \"%s\" from constructor", (locale) => {
    const instance = new AppBridge({
      initialLocale: locale,
    });

    expect(instance.getState().locale).toBe(locale);
  });

  it("Detects locale from URL param and set it to be initial", () => {
    const localeToOverwrite = "pl";

    const currentLocationHref = window.location.href;

    window.location.href = `${origin}?domain=${domain}&id=appid&locale=${localeToOverwrite}`;

    expect(new AppBridge().getState().locale).toBe(localeToOverwrite);

    window.location.href = currentLocationHref;
  });

  it("Detects theme from URL param and set it to be initial", () => {
    const themeToOverwrite = "dark";

    const currentLocationHref = window.location.href;

    window.location.href = `${origin}?domain=${domain}&id=appid&theme=${themeToOverwrite}`;

    expect(new AppBridge().getState().theme).toBe(themeToOverwrite);

    window.location.href = currentLocationHref;
  });

  it("dispatches 'notifyReady' action when enabled in constructor", () =>
    new Promise<void>((res) => {
      window.addEventListener("message", (event) => {
        if (event.data.type === ActionType.notifyReady) {
          res();
        }
      });

      appBridge = new AppBridge({ autoNotifyReady: true });
    }));

  it("Overwrites token after tokenRefresh action is triggered", () => {
    const tokenRefreshEvent = DashboardEventFactory.createTokenRefreshEvent("new-token");

    expect(appBridge.getState().token).toBeUndefined();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: handshakeEvent,
        origin,
      })
    );

    expect(appBridge.getState().token).toEqual(handshakeEvent.payload.token);

    fireEvent(
      window,
      new MessageEvent("message", {
        data: tokenRefreshEvent,
        origin,
      })
    );

    expect(appBridge.getState().token).toEqual(tokenRefreshEvent.payload.token);
  });

  it("Saves saleorVersion field if provided in the Handshake event", () => {
    expect(appBridge.getState().saleorVersion).toBeUndefined();
    expect(appBridge.getState().dashboardVersion).toBeUndefined();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: DashboardEventFactory.createHandshakeEvent(validJwtToken, 1, {
          core: "3.15.0",
          dashboard: "3.15.1",
        }),
        origin,
      })
    );

    expect(appBridge.getState().token).toEqual(validJwtToken);
    expect(appBridge.getState().saleorVersion).toEqual("3.15.0");
    expect(appBridge.getState().dashboardVersion).toEqual("3.15.1");
  });
});
