import { describe, expect, it } from "vitest";

import { OpenPopupParams } from "./open-popup-params";

describe("OpenPopupParams", () => {
  it("exposes the appParams url key", () => {
    expect(OpenPopupParams.urlKey).toBe("appParams");
  });

  it("round-trips an arbitrary nested JSON value", () => {
    const value = { mode: "full", nested: { ids: [1, 2, 3], flag: true }, nothing: null };

    expect(OpenPopupParams.parse(OpenPopupParams.serialize(value))).toEqual(value);
  });

  it("round-trips non-ASCII / unicode content", () => {
    const value = { title: "Zażółć gęślą jaźń", emoji: "🚀✨", cjk: "你好" };

    expect(OpenPopupParams.parse(OpenPopupParams.serialize(value))).toEqual(value);
  });

  it("serializes to a base64 string", () => {
    const serialized = OpenPopupParams.serialize({ a: 1 });

    // valid base64 only contains these characters
    expect(serialized).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(atob(serialized)).toBe(JSON.stringify({ a: 1 }));
  });

  it("serializes a payload at the size limit", () => {
    // { "v": "x...x" } -> pad so the stringified JSON is exactly the max length
    const filler = "x".repeat(OpenPopupParams.maxParamsLength - JSON.stringify({ v: "" }).length);

    expect(() => OpenPopupParams.serialize({ v: filler })).not.toThrow();
  });

  it("throws when the serialized JSON exceeds the size limit", () => {
    const value = { big: "x".repeat(OpenPopupParams.maxParamsLength) };

    expect(() => OpenPopupParams.serialize(value)).toThrow(/OpenPopup params too large/);
  });

  it("throws when parsing an invalid base64 / JSON value", () => {
    expect(() => OpenPopupParams.parse("not-valid-base64-#@!")).toThrow();
  });
});
