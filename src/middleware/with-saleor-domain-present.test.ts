import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SALEOR_DOMAIN_HEADER } from "../const";
import { withSaleorDomainPresent } from "./with-saleor-domain-present";

const getMockSuccessResponse = async () => Response.OK({});

describe("middleware", () => {
  describe("withSaleorDomainPresent", () => {
    let mockHandlerFn: Handler = vi.fn(getMockSuccessResponse);

    beforeEach(() => {
      mockHandlerFn = vi.fn(getMockSuccessResponse);
    });

    it("Pass request when request has Saleor Domain header", async () => {
      const mockRequest = {
        context: {},
        headers: {
          [SALEOR_DOMAIN_HEADER]: "example.com",
        },
      } as unknown as Request;

      const response = await withSaleorDomainPresent(mockHandlerFn)(mockRequest);

      expect(response.status).toBe(200);
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });

    it("Reject request when Saleor domain header is not present", async () => {
      const mockRequest = {
        context: {},
        headers: {},
      } as unknown as Request;

      const response = await withSaleorDomainPresent(mockHandlerFn)(mockRequest);
      expect(response.status).eq(400);
      expect(mockHandlerFn).toBeCalledTimes(0);
    });
  });
});
