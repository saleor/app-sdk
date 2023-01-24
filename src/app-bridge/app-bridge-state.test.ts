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
      locale: "en",
      saleorApiUrl: "",
    });
  });

  it("Can update state", () => {
    const instance = new AppBridgeStateContainer();

    const newState: Partial<AppBridgeState> = {
      domain: "my-saleor-instance.cloud",
      saleorApiUrl: "https://my-saleor-instance.cloud/graphql/",
      id: "foo-bar",
      path: "/",
      theme: "dark",
      locale: "pl",
    };

    instance.setState(newState);

    expect(instance.getState()).toEqual(expect.objectContaining(newState));
  });

  it("Set \"en\" to be initial locale value", () => {
    expect(new AppBridgeStateContainer().getState().locale).toEqual("en");
  });

  it("Can be constructed with initial locale", () => {
    expect(
      new AppBridgeStateContainer({
        initialLocale: "pl",
      }).getState().locale
    ).toBe("pl");
  });

  it("Can be constructed with initial theme", () => {
    expect(
      new AppBridgeStateContainer({
        initialTheme: "dark",
      }).getState().theme
    ).toBe("dark");
  });
});
