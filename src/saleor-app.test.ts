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
});
