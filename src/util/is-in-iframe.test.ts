import { afterEach, describe, expect, it, vi } from "vitest";

import { isInIframe } from "./is-in-iframe";

describe("isInIframe", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when the document location matches the parent location (not framed)", () => {
    // In jsdom window.parent === window, so the locations are identical.
    expect(isInIframe()).toBe(false);
  });

  it("returns true when the document location differs from the parent location", () => {
    vi.spyOn(window, "parent", "get").mockReturnValue({
      location: { href: "https://dashboard.saleor.io" },
    } as Window);

    expect(isInIframe()).toBe(true);
  });

  it("returns false when accessing the parent location throws (cross-origin)", () => {
    vi.spyOn(window, "parent", "get").mockReturnValue({
      get location() {
        throw new Error("Blocked a frame with origin from accessing a cross-origin frame.");
      },
    } as unknown as Window);

    expect(isInIframe()).toBe(false);
  });
});
