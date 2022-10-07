import { afterEach, describe, expect, it, vi } from "vitest";

import { FileAPL } from "./APL";
import { SaleorApp } from "./saleor-app";

describe("SaleorApp", () => {
  const initialEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...initialEnv };
    vi.resetModules();
  });

  it("Constructs", () => {
    const instance = new SaleorApp({
      apl: new FileAPL(),
    });

    expect(instance).toBeDefined();
    expect(instance.apl).toBeInstanceOf(FileAPL);
  });

  it("SaleorApp.validateRequiredEnv can check if env provided in constructor exist and has length longer than 0", () => {
    const instance = new SaleorApp({
      apl: new FileAPL(),
      requiredEnvVars: ["REQUIRED_ENV"],
    });

    expect(instance.validateRequiredEnv()).toEqual({
      valid: false,
      invalidEnvName: "REQUIRED_ENV",
    });

    process.env.REQUIRED_ENV = "";

    expect(instance.validateRequiredEnv()).toEqual({
      valid: false,
      invalidEnvName: "REQUIRED_ENV",
    });

    process.env.REQUIRED_ENV = "correct";

    expect(instance.validateRequiredEnv()).toEqual({
      valid: true,
    });
  });
});
