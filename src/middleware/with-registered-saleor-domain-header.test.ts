import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SALEOR_API_URL_HEADER, SALEOR_DOMAIN_HEADER } from "../const";
import { SaleorApp } from "../saleor-app";
import { MockAPL } from "../test-utils/mock-apl";
import { withRegisteredSaleorDomainHeader } from "./with-registered-saleor-domain-header";
import { withSaleorApp } from "./with-saleor-app";

const getMockSuccessResponse = async () => Response.OK({});

describe("middleware", () => {
  describe("withRegisteredSaleorDomainHeader", () => {
    let mockHandlerFn: Handler = vi.fn(getMockSuccessResponse);

    const mockAPL = new MockAPL();

    beforeEach(() => {
      mockHandlerFn = vi.fn(getMockSuccessResponse);
    });

    it("Pass request when auth data are available", async () => {
      const mockRequest = {
        context: {},
        headers: {
          host: "my-saleor-env.saleor.cloud",
          "x-forwarded-proto": "https",
          [SALEOR_DOMAIN_HEADER]: mockAPL.workingSaleorDomain,
          [SALEOR_API_URL_HEADER]: mockAPL.workingSaleorApiUrl,
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
          [SALEOR_API_URL_HEADER]: "https://not-registered.example.com/graphql/",
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
          [SALEOR_DOMAIN_HEADER]: mockAPL.workingSaleorDomain,
          [SALEOR_API_URL_HEADER]: mockAPL.workingSaleorApiUrl,
        },
      } as unknown as Request;

      const response = await withRegisteredSaleorDomainHeader(mockHandlerFn)(mockRequest);

      expect(response.status).eq(500);
    });
  });
});
