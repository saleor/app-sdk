import { fireEvent } from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// mock document.referrer
const origin = "http://example.com";
Object.defineProperty(window.document, "referrer", {
  value: origin,
  writable: true,
});

Object.defineProperty(window, "location", {
  value: {
    href: `${origin}?domain=saleor.domain&id=appid`,
  },
  writable: true,
});

// eslint-disable-next-line
import { actions, DispatchResponseEvent, HandshakeEvent, AppBridge } from ".";

const handshakeEvent: HandshakeEvent = {
  payload: {
    token: "mock-token",
    version: 1,
  },
  type: "handshake",
};

describe("AppBridge", () => {
  const domain = "saleor.domain.host";
  let appBridge = new AppBridge();

  beforeEach(() => {
    appBridge = new AppBridge();
  });

  it("correctly sets the default domain, if not set in constructor", () => {
    expect(appBridge.getState().domain).toEqual(domain);
  });

  it("authenticates", () => {
    expect(appBridge.getState().ready).toBe(false);

    const token = "test-token";
    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload: { token } },
        origin,
      })
    );

    expect(appBridge.getState().ready).toBe(true);
    expect(appBridge.getState().token).toEqual(token);
  });

  it("subscribes to an event and returns unsubscribe function", () => {
    const callback = vi.fn();
    const unsubscribe = appBridge.subscribe("handshake", callback);

    expect(callback).not.toHaveBeenCalled();

    const token = "fresh-token";

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
        data: { type: "handshake", payload: { token: "123" } },
        origin,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(appBridge.getState().token).toEqual("123");
  });

  it("persists domain", () => {
    expect(appBridge.getState().domain).toEqual(domain);
  });

  it("dispatches valid action", () => {
    const target = "/test";
    const action = actions.Redirect({ to: target });

    window.addEventListener("message", (event) => {
      if (event.data.type === action.type) {
        fireEvent(
          window,
          new MessageEvent("message", {
            data: {
              type: "response",
              payload: { ok: true, actionId: action.payload.actionId },
            } as DispatchResponseEvent,
            origin,
          })
        );
      }
    });

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
});
