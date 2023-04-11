import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withBaseURL } from "./with-base-url";

const getMockEmptyResponse = async () => ({} as Response);

describe("middleware", () => {
  describe("withBaseURL", () => {
    let mockHandlerFn: Handler = vi.fn(getMockEmptyResponse);

    beforeEach(() => {
      mockHandlerFn = vi.fn();
    });

    it("Adds base URL from request header to context and calls handler", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": "https",
        },
      } as unknown as Request;

      await withBaseURL(mockHandlerFn)(mockRequest);

      expect(mockRequest.context.baseURL).toBe("https://my-saleor-env.saleor.cloud");
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });

    it("supports multiple comma-delimited values in x-forwarded-proto", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": "https,http",
        },
      } as unknown as Request;

      await withBaseURL(mockHandlerFn)(mockRequest);

      expect(mockRequest.context.baseURL).toBe("https://my-saleor-env.saleor.cloud");
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });

    it("supports multiple x-forwarded-proto headers", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": ["http", "ftp,https"],
        },
      } as unknown as Request;

      await withBaseURL(mockHandlerFn)(mockRequest);

      expect(mockRequest.context.baseURL).toBe("https://my-saleor-env.saleor.cloud");
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });
  });
});
