import { fireEvent } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";

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
import { actions, DispatchResponseEvent, createApp } from ".";

describe("createApp", () => {
  const domain = "saleor.domain.host";
  const app = createApp(domain);

  it("correctly sets the domain", () => {
    expect(app.getState().domain).toEqual(domain);
  });

  it("authenticates", () => {
    expect(app.getState().ready).toBe(false);

    const token = "test-token";
    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload: { token } },
        origin,
      })
    );

    expect(app.getState().ready).toBe(true);
    expect(app.getState().token).toEqual(token);
  });

  it("subscribes to an event and returns unsubcribe function", () => {
    // subscribe
    const callback = vi.fn();
    const unsubscribe = app.subscribe("handshake", callback);

    expect(callback).not.toHaveBeenCalled();

    const token = "fresh-token";
    // correct event
    const payload = {
      token,
      version: 1,
    };
    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload },
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
    expect(callback).toHaveBeenCalledWith(payload);
    expect(app.getState().token).toEqual(token);
    expect(app.getState().id).toEqual("appid");

    // unsubscribe
    unsubscribe();

    fireEvent(
      window,
      new MessageEvent("message", {
        data: { type: "handshake", payload: { token: "123" } },
        origin,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(app.getState().token).toEqual("123");
  });

  it("persists domain", () => {
    expect(app.getState().domain).toEqual(domain);
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

    return expect(app.dispatch(action)).resolves.toBeUndefined();
  });

  it("times out after action response has not been registered", () =>
    expect(app.dispatch(actions.Redirect({ to: "/test" }))).rejects.toBeInstanceOf(Error));
});
