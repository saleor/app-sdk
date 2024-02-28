import { describe, expect, it } from "vitest";

import { parseSchemaVersion } from "./schema-version";

describe("parseSchemaVersion", () => {
  it("Parses version string", () => {
    expect(parseSchemaVersion("3.19.1")).toBe(3.19);
  });
});
