import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APL } from "../APL";
import { SALEOR_DOMAIN_HEADER } from "../const";
import { SaleorApp } from "../saleor-app";
import { withRegisteredSaleorDomainHeader } from "./with-registered-saleor-domain-header";
import { withSaleorApp } from "./with-saleor-app";

const getMockSuccessResponse = async () => Response.OK({});

describe("middleware", () => {
  describe("withRegisteredSaleorDomainHeader", () => {
    let mockHandlerFn: Handler = vi.fn(getMockSuccessResponse);

    const mockAPL: APL = {
      get: async (domain: string) =>
        domain === "example.com"
          ? {
              domain: "example.com",
              token: "mock-token",
            }
          : undefined,
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
    };

    beforeEach(() => {
      mockHandlerFn = vi.fn(getMockSuccessResponse);
    });

    it("Pass request when auth data are available", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": "https",
          [SALEOR_DOMAIN_HEADER]: "example.com",
        },
      } as unknown as Request;

      const app = new SaleorApp({
        apl: mockAPL,
      });

      const response = await withSaleorApp(app)(withRegisteredSaleorDomainHeader(mockHandlerFn))(
        mockRequest
      );

      expect(response.status).toBe(200);
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });

    it("Reject request when auth data are not available", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": "https",
          [SALEOR_DOMAIN_HEADER]: "not-registered.example.com",
        },
      } as unknown as Request;

      const app = new SaleorApp({
        apl: mockAPL,
      });

      const response = await withSaleorApp(app)(withRegisteredSaleorDomainHeader(mockHandlerFn))(
        mockRequest
      );
      expect(response.status).eq(403);
      expect(mockHandlerFn).toBeCalledTimes(0);
    });

    it("Throws if SaleorApp not found in context", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": "https",
          [SALEOR_DOMAIN_HEADER]: "example.com",
        },
      } as unknown as Request;

      const response = await withRegisteredSaleorDomainHeader(mockHandlerFn)(mockRequest);

      expect(response.status).eq(500);
    });
  });
});
