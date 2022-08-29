import { describe, expect, it } from "vitest";

import { AppBridgeState, AppBridgeStateContainer } from "./app-bridge-state";

describe("app-bridge-state.ts", () => {
  it("Creates with default state", () => {
    const instance = new AppBridgeStateContainer();

    expect(instance.getState()).toEqual({
      id: "",
      domain: "",
      ready: false,
      path: "/",
      theme: "light",
    });
  });

  it("Can update state", () => {
    const instance = new AppBridgeStateContainer();

    const newState: Partial<AppBridgeState> = {
      domain: "https://my-saleor-instance.cloud",
      id: "foo-bar",
      path: "/",
      theme: "light",
    };

    instance.setState(newState);

    expect(instance.getState()).toEqual(expect.objectContaining(newState));
  });
});
