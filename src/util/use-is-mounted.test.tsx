import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsMounted } from "./use-is-mounted";

describe("useIsMounted", () => {
  it("returns true once the component has mounted", () => {
    const { result } = renderHook(() => useIsMounted());

    // React Testing Library flushes effects, so the mount effect has already run.
    expect(result.current).toBe(true);
  });
});
