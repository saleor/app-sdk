import { describe, expect, it } from "vitest";

import { WebApiAdapter } from "./platform-adapter";

describe("WebApiAdapter", () => {
  const headers = new Headers({
    "Content-Type": "application/json",
    host: "example.com",
    "x-forwarded-proto": "https, http",
  });
  describe("getHeader", () => {
    it("should return the corresponding header value or null", () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers,
        body: JSON.stringify({ foo: "bar" }),
      });
      const adapter = new WebApiAdapter(request, Response);

      expect(adapter.getHeader("host")).toBe("example.com");
      expect(adapter.getHeader("non-existent")).toBeNull();
    });
  });

  describe("getBody", () => {
    it("should return the parsed JSON body", async () => {
      const sampleJson = { key: "value" };
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers,
        body: JSON.stringify(sampleJson),
      });
      const adapter = new WebApiAdapter(request, Response);
      const body = await adapter.getBody();
      expect(body).toEqual(sampleJson);
    });

    it("should throw exception when JSON cannot be parsed", async () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers,
        body: "{ ", // invalid JSON
      });
      const adapter = new WebApiAdapter(request, Response);
      await expect(adapter.getBody()).rejects.toThrowError();
    });

    it("should allow reading original request stream, not disturbing it", async () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers,
        body: "{}",
      });
      const adapter = new WebApiAdapter(request, Response);
      await adapter.getBody();
      expect(request.bodyUsed).toBe(false);

      // Reading should work because stream wasn't disturbed
      await expect(request.text()).resolves.toBe("{}");
    });
  });

  describe("getRawBody", () => {
    it("should return the text body", async () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "text/plain",
          host: "example.com",
        }),
        body: "plain text",
      });
      const adapter = new WebApiAdapter(request, Response);
      const body = await adapter.getRawBody();
      expect(body).toBe("plain text");
    });

    it("should allow reading original request stream, not disturbing it", async () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "text/plain",
          host: "example.com",
        }),
        body: "plain text",
      });
      const adapter = new WebApiAdapter(request, Response);
      await adapter.getRawBody();
      expect(request.bodyUsed).toBe(false);

      // Reading should work because stream wasn't disturbed
      await expect(request.text()).resolves.toBe("plain text");
    });
  });

  describe("getBaseUrl", () => {
    it("should return base url with protocol from x-forwarded-proto", () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers: new Headers({
          host: "example.com",
          "x-forwarded-proto": "https",
        }),
        body: JSON.stringify({ foo: "bar" }),
      });
      const adapter = new WebApiAdapter(request, Response);
      expect(adapter.getBaseUrl()).toBe("https://example.com");
    });

    it("should prefer https when x-forwarded-proto has multiple values", () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers: new Headers({
          host: "example.com",
          "x-forwarded-proto": "https,http,wss",
        }),
        body: JSON.stringify({ foo: "bar" }),
      });
      const adapter = new WebApiAdapter(request, Response);
      expect(adapter.getBaseUrl()).toBe("https://example.com");
    });

    it("should prefer http when x-forwarded-proto has multiple values and https is not present", () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers: new Headers({
          host: "example.com",
          "x-forwarded-proto": "wss,http",
        }),
        body: JSON.stringify({ foo: "bar" }),
      });
      const adapter = new WebApiAdapter(request, Response);
      expect(adapter.getBaseUrl()).toBe("http://example.com");
    });

    it("should use first protocol when https is not present in x-forwarded-proto", () => {
      const request = new Request("https://example.com/api", {
        method: "POST",
        headers: new Headers({
          host: "example.com",
          "x-forwarded-proto": "wss,ftp",
        }),
        body: JSON.stringify({ foo: "bar" }),
      });
      const adapter = new WebApiAdapter(request, Response);
      expect(adapter.getBaseUrl()).toBe("wss://example.com");
    });

    it("should use protocol from Request URL when `x-forwarded-proto` header is not present", () => {
      const request = new Request("http://example.com/api", {
        method: "GET",
        headers: new Headers({
          host: "example.org",
        }),
      });
      const adapter = new WebApiAdapter(request, Response);
      expect(adapter.getBaseUrl()).toBe("http://example.org");
    });

    describe("method getter", () => {
      it("should return POST method when used in request", () => {
        const request = new Request("https://example.com/api", {
          method: "POST",
          headers: new Headers({
            host: "example.com",
          }),
          body: JSON.stringify({ foo: "bar" }),
        });
        const adapter = new WebApiAdapter(request, Response);
        expect(adapter.method).toBe("POST");
      });

      it("should return GET method when used in request", () => {
        const request = new Request("https://example.com/api", {
          method: "GET",
          headers: new Headers({
            host: "example.com",
          }),
        });
        const adapter = new WebApiAdapter(request, Response);
        expect(adapter.method).toBe("GET");
      });
    });

    describe("send", () => {
      it("should return a Response with a JSON body and appropriate headers", async () => {
        const sampleJson = { foo: "bar" };
        const request = new Request("https://example.com/api", {
          method: "POST",
          headers: new Headers({
            host: "example.com",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(sampleJson),
        });
        const adapter = new WebApiAdapter(request, Response);
        const response = await adapter.send({
          bodyType: "json" as const,
          body: sampleJson,
          status: 201,
        });
        expect(response.status).toBe(201);
        expect(response.headers.get("Content-Type")).toBe("application/json");

        const responseBody = await response.json();
        expect(responseBody).toEqual(sampleJson);
      });

      it("should return a Response with plain text body and appropriate headers", async () => {
        const request = new Request("https://example.com/api", {
          method: "POST",
          headers: new Headers({
            host: "example.com",
            "Content-Type": "text/plain",
          }),
          body: "plain text",
        });
        const adapter = new WebApiAdapter(request, Response);
        const response = await adapter.send({
          status: 200,
          body: "Some text",
          bodyType: "string",
        });
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("text/plain");

        const responseBody = await response.text();
        expect(responseBody).toBe("Some text");
      });
    });
  });
});
