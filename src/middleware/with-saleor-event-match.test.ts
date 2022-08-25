import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SALEOR_EVENT_HEADER } from "../const";
import { withSaleorEventMatch } from "./with-saleor-event-match";

const getMockSuccessResponse = async () => Response.OK({});

describe("middleware", () => {
  describe("withSaleorEventMatch", () => {
    let mockHandlerFn: Handler = vi.fn(getMockSuccessResponse);

    beforeEach(() => {
      mockHandlerFn = vi.fn(getMockSuccessResponse);
    });

    it("Pass request when request has expected event header", async () => {
      const eventName = "product-updated";
      const mockRequest = {
        context: {},
        headers: {
          [SALEOR_EVENT_HEADER]: eventName,
        },
      } as unknown as Request;

      const response = await withSaleorEventMatch(eventName)(mockHandlerFn)(mockRequest);

      expect(response.status).toBe(200);
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });

    it("Reject request when event header is not present", async () => {
      const mockRequest = {
        context: {},
        headers: {},
      } as unknown as Request;

      const response = await withSaleorEventMatch("product-updated")(mockHandlerFn)(mockRequest);
      expect(response.status).eq(400);
      expect(mockHandlerFn).toBeCalledTimes(0);
    });

    it("Reject request when event header does not match", async () => {
      const mockRequest = {
        context: {},
        headers: {
          [SALEOR_EVENT_HEADER]: "wrong-event",
        },
      } as unknown as Request;

      const response = await withSaleorEventMatch("product-updated")(mockHandlerFn)(mockRequest);
      expect(response.status).eq(400);
      expect(mockHandlerFn).toBeCalledTimes(0);
    });
  });
});
