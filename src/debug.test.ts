import { describe, expect,it , vi} from "vitest";

import { createDebug, registerDebugLogger } from "./debug";

describe("Debug", () => {
  it("Registers hook on log creation", () =>{
    const mock = vi.fn()

    registerDebugLogger((args) => mock(args))
    const debug= createDebug("foo");

    debug.log("message %s", "injected");

    expect(mock).toHaveBeenCalledWith("")

  })
})