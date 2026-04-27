import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JwksCache } from "./jwks-cache";

describe("JwksCache", () => {
  let cache: JwksCache;

  beforeEach(() => {
    cache = new JwksCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined when nothing has been set", () => {
    expect(cache.get()).toBeUndefined();
  });

  it("returns the stored jwks after set", () => {
    cache.set("{\"keys\":[]}", 1000);

    expect(cache.get()).toBe("{\"keys\":[]}");
  });

  it("overwrites previous jwks on second set", () => {
    cache.set("first", 1000);
    cache.set("second", 1000);

    expect(cache.get()).toBe("second");
  });

  it("returns undefined after TTL elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));

    cache.set("{\"keys\":[]}", 1000);

    vi.advanceTimersByTime(1001);

    expect(cache.get()).toBeUndefined();
  });

  it("returns the value just before TTL elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));

    cache.set("{\"keys\":[]}", 1000);

    vi.advanceTimersByTime(999);

    expect(cache.get()).toBe("{\"keys\":[]}");
  });

  it("clears the cache", () => {
    cache.set("{\"keys\":[]}", 1000);
    cache.clear();

    expect(cache.get()).toBeUndefined();
  });
});
