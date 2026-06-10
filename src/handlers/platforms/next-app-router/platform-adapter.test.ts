import { NextRequest } from "next/server.js";
import { describe, expect, it } from "vitest";

import { NextAppRouterAdapter } from "./platform-adapter";

describe("NextAppRouterAdapter", () => {
  it("extends WebApiAdapter behaviour, reading headers from NextRequest", () => {
    const request = new NextRequest("https://example.com/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: "example.com",
      },
      body: JSON.stringify({ foo: "bar" }),
    });
    const adapter = new NextAppRouterAdapter(request);

    expect(adapter.getHeader("host")).toBe("example.com");
    expect(adapter.getHeader("non-existent")).toBeNull();
  });

  it("exposes the request method", () => {
    const request = new NextRequest("https://example.com/api", { method: "POST" });
    const adapter = new NextAppRouterAdapter(request);

    expect(adapter.method).toBe("POST");
  });

  it("resolves base url preferring https from x-forwarded-proto", () => {
    const request = new NextRequest("https://example.com/api", {
      headers: {
        host: "example.com",
        "x-forwarded-proto": "http,https",
      },
    });
    const adapter = new NextAppRouterAdapter(request);

    expect(adapter.getBaseUrl()).toBe("https://example.com");
  });

  it("parses the request JSON body without disturbing the original stream", async () => {
    const request = new NextRequest("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "value" }),
    });
    const adapter = new NextAppRouterAdapter(request);

    await expect(adapter.getBody()).resolves.toEqual({ key: "value" });
    expect(request.bodyUsed).toBe(false);
  });

  it("sends a JSON response built from the action result", async () => {
    const request = new NextRequest("https://example.com/api", { method: "POST" });
    const adapter = new NextAppRouterAdapter(request);

    const response = await adapter.send({
      bodyType: "json",
      body: { foo: "bar" },
      status: 201,
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    await expect(response.json()).resolves.toEqual({ foo: "bar" });
  });
});
