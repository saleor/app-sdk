import { describe, expect, it } from "vitest";

import { AppBridgeState, AppBridgeStateContainer } from "./app-bridge-state";

describe("app-bridge-state.ts", () => {
  it("Creates with default state", () => {
    const instance = new AppBridgeStateContainer();

    expect(instance.getState()).toEqual({
      id: "",
      ready: false,
      path: "/",
      theme: "light",
      locale: "en",
      saleorApiUrl: "",
      formContext: {},
      dashboardShortcuts: [],
    });
  });

  it("Can update state", () => {
    const instance = new AppBridgeStateContainer();

    const newState: Partial<AppBridgeState> = {
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
      }).getState().locale,
    ).toBe("pl");
  });

  it("Can be constructed with initial theme", () => {
    expect(
      new AppBridgeStateContainer({
        initialTheme: "dark",
      }).getState().theme,
    ).toBe("dark");
  });

  it("Stores appParams passed via setState", () => {
    const instance = new AppBridgeStateContainer();
    const appParams = { mode: "full", productId: "prod-1" };

    instance.setState({ appParams });

    expect(instance.getState().appParams).toEqual(appParams);
  });

  it("Leaves appParams undefined by default", () => {
    expect(new AppBridgeStateContainer().getState().appParams).toBeUndefined();
  });

  it("Defaults dashboardShortcuts to an empty list", () => {
    expect(new AppBridgeStateContainer().getState().dashboardShortcuts).toEqual([]);
  });
});
