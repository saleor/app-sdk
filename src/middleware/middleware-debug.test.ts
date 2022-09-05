import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { describe, expect, it, vi } from "vitest";

import { withReqResDebugging } from "./middleware-debug";

describe("withReqResDebugging", () => {
  it("Logs request and response to debug", async () => {
    const mockDebug = vi.fn();
    const handler: Handler = async () => Response.OK("Tested handler is ok");
    const wrappedHandler = withReqResDebugging(() => mockDebug)(handler);

    const mockReqBody = JSON.stringify({ foo: "bar" });

    await wrappedHandler({ rawBody: mockReqBody } as Request);

    expect(mockDebug).toHaveBeenNthCalledWith(1, "Called with request %j", {
      rawBody: mockReqBody,
    });

    expect(mockDebug).toHaveBeenNthCalledWith(2, "Responded with response %j", {
      body: "Tested handler is ok",
      headers: {},
      status: 200,
    });
  });
});
