---
to: src/<%= name.toLowerCase() %>.test.ts
---
import { describe, expect } from "vitest";

import { newUtil } from "./<%= name.toLowerCase() %>";

describe("<%= name.toLowerCase() %>.ts", () => {
  describe("newUtil", () => {
    expect(newUtil()).toBe("hello")
  });
});
