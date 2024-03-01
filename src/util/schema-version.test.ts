import { describe, expect, test } from "vitest";

import { parseSchemaVersion } from "./schema-version";

describe("parseSchemaVersion", () => {
  test.each([
    {
      rawVersion: "3",
      parsedVersion: null,
    },
    {
      rawVersion: "3.19",
      parsedVersion: 3.19,
    },
    {
      rawVersion: "3.19.1",
      parsedVersion: 3.19,
    },
    {
      rawVersion: "malformed",
      parsedVersion: null,
    },
    {
      rawVersion: "malformed.raw",
      parsedVersion: null,
    },
    {
      rawVersion: "malformed.raw.version",
      parsedVersion: null,
    },
    {
      rawVersion: null,
      parsedVersion: null,
    },
    {
      rawVersion: undefined,
      parsedVersion: null,
    },
  ])(
    "Parses version string from: $rawVersion to: $parsedVersion",
    ({ rawVersion, parsedVersion }) => {
      expect(parseSchemaVersion(rawVersion)).toBe(parsedVersion);
    }
  );
});
