import { createMocks } from "node-mocks-http";
import getRawBody from "raw-body";
import { describe, expect, it, vi } from "vitest";

import { NextJsAdapter } from "./platform-adapter";

vi.mock("raw-body");

describe("NextJsAdapter", () => {
  describe("getHeader", () => {
    it("should return single header value", () => {
      const { req, res } = createMocks({
        headers: {
          "content-type": "application/json",
        },
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getHeader("content-type")).toBe("application/json");
    });

    it("should join multiple header values", () => {
      const { req, res } = createMocks({
        headers: {
          // @ts-expect-error node-mocks-http types != real NextJsRequest
          accept: ["text/html", "application/json"],
        },
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getHeader("accept")).toBe("text/html, application/json");
    });

    it("should return null for non-existent header", () => {
      const { req, res } = createMocks();
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getHeader("non-existent")).toBeNull();
    });
  });

  describe("getBody", () => {
    it("should return request body", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { data: "test" },
      });
      const adapter = new NextJsAdapter(req, res);
      const body = await adapter.getBody();
      expect(body).toEqual({ data: "test" });
    });
  });

  describe("getRawBody", () => {
    it("should return raw body string", async () => {
      const { req, res } = createMocks({
        headers: {
          "content-length": "10",
        },
      });
      const adapter = new NextJsAdapter(req, res);

      vi.mocked(getRawBody).mockResolvedValueOnce(Buffer.from("test body"));

      const result = await adapter.getRawBody();
      expect(result).toBe("test body");
      expect(getRawBody).toHaveBeenCalledWith(req, { length: "10" });
    });
  });

  describe("getBaseUrl", () => {
    it("should use x-forwarded-proto header for protocol", () => {
      const { req, res } = createMocks({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "https",
        },
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getBaseUrl()).toBe("https://example.com");
    });

    it("should prefer https when x-forwarded-proto has multiple values", () => {
      const { req, res } = createMocks({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "http,https,wss",
        },
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getBaseUrl()).toBe("https://example.com");
    });

    it("should prefer http when x-forwarded-proto has multiple values and https is not present", () => {
      const { req, res } = createMocks({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "wss,http",
        },
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getBaseUrl()).toBe("http://example.com");
    });

    it("should use first protocol when https is not present in x-forwarded-proto", () => {
      const { req, res } = createMocks({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "wss,ftp",
        },
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.getBaseUrl()).toBe("wss://example.com");
    });
  });

  describe("method", () => {
    it("should return POST method when used in request", () => {
      const { req, res } = createMocks({
        method: "POST",
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.method).toBe("POST");
    });

    it("should return GET method when used in request", () => {
      const { req, res } = createMocks({
        method: "GET",
      });
      const adapter = new NextJsAdapter(req, res);
      expect(adapter.method).toBe("GET");
    });
  });
});
