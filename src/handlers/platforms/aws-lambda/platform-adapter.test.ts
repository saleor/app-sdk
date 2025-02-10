import { describe, expect, it } from "vitest";

import { AwsLambdaAdapter } from "./platform-adapter";
import { createLambdaEvent, mockLambdaContext } from "./test-utils";

describe("AwsLambdaAdapter", () => {
  describe("getHeader", () => {
    it("should return the corresponding header value or null", () => {
      const event = createLambdaEvent({
        headers: {
          "content-type": "application/json",
          host: "example.com",
          "x-forwarded-proto": "https, http",
        },
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      // Works with all lowercase
      expect(adapter.getHeader("host")).toBe("example.com");
      // Works with Pascal-case
      expect(adapter.getHeader("Host")).toBe("example.com");
      expect(adapter.getHeader("X-Forwarded-Proto")).toBe("https, http");
      // Returns null for non existent headers
      expect(adapter.getHeader("non-existent")).toBeNull();
    });
  });

  describe("getBody", () => {
    it("should return the parsed JSON body", async () => {
      const sampleJson = { key: "value" };
      const event = createLambdaEvent({
        body: JSON.stringify(sampleJson),
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      const body = await adapter.getBody();
      expect(body).toEqual(sampleJson);
    });

    it("should throw exception when JSON cannot be parsed", async () => {
      const event = createLambdaEvent({
        body: "{ ", // invalid JSON
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      await expect(adapter.getBody()).rejects.toThrowError();
    });

    it("should return null when body is empty", async () => {
      const event = createLambdaEvent({ body: undefined });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      const body = await adapter.getBody();
      expect(body).toBeNull();
    });
  });

  describe("getRawBody", () => {
    it("should return the text body", async () => {
      const event = createLambdaEvent({
        body: "plain text",
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      const body = await adapter.getRawBody();
      expect(body).toBe("plain text");
    });

    it("should return null when body is empty", async () => {
      const event = createLambdaEvent({ body: undefined });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      const body = await adapter.getRawBody();
      expect(body).toBeNull();
    });
  });

  describe("getBaseUrl", () => {
    // Note: AWS lambda uses stages which are passed in lambda request context
    // Contexts are appended to the lambda base URL, like so: <baseUrl>/<stage>
    // In this case we're simulating test stage, which results in <baseUrl>/test
    // More details: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html

    it("should return base url with protocol from x-forwarded-proto", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "https",
        },
      });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("https://example.com");
    });

    it("should prefer https when x-forwarded-proto has multiple values", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "https,http,wss",
        },
      });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("https://example.com");
    });

    it("should prefer http when x-forwarded-proto has multiple values and https is not present", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "wss,http",
        },
      });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("http://example.com");
    });

    it("should use first protocol when http or https is not present in x-forwarded-proto", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.com",
          "x-forwarded-proto": "wss,ftp",
        },
      });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("wss://example.com");
    });

    it("should use https as default when x-forwarded-proto header is not present", () => {
      const event = createLambdaEvent({
        headers: { host: "example.org" },
      });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("https://example.org");
    });

    it("should exclude $default stage in base url when present", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.org",
          "x-forwarded-proto": "https",
        },
        requestContext: {
          stage: "$default",
        },
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("https://example.org");
    });

    it("should exclude stage in base url if missing", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.org",
          "x-forwarded-proto": "https",
        },
        requestContext: {
          stage: undefined,
        },
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("https://example.org");
    });

    it("should include stage in base url when present", () => {
      const event = createLambdaEvent({
        headers: {
          host: "example.org",
          "x-forwarded-proto": "https",
        },
        requestContext: {
          stage: "test",
        },
      });

      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.getBaseUrl()).toBe("https://example.org/test");
    });
  });

  describe("method getter", () => {
    it("should return POST method when used in request", () => {
      const event = createLambdaEvent({ method: "POST" });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.method).toBe("POST");
    });

    it("should return GET method when used in request", () => {
      const event = createLambdaEvent({ method: "GET" });
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      expect(adapter.method).toBe("GET");
    });
  });

  describe("send", () => {
    it("should return a response with a JSON body and appropriate headers", async () => {
      const event = createLambdaEvent();
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);
      const sampleJson = { foo: "bar" };

      const response = await adapter.send({
        bodyType: "json",
        body: sampleJson,
        status: 201,
      });

      expect(response).toEqual({
        statusCode: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sampleJson),
      });
    });

    it("should return a response with plain text body and appropriate headers", async () => {
      const event = createLambdaEvent();
      const adapter = new AwsLambdaAdapter(event, mockLambdaContext);

      const response = await adapter.send({
        status: 200,
        body: "Some text",
        bodyType: "string",
      });

      expect(response).toEqual({
        statusCode: 200,
        headers: {
          "Content-Type": "text/plain",
        },
        body: "Some text",
      });
    });
  });
});
