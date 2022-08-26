import { Handler, Request } from "retes";
import { Response } from "retes/response";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withAuthTokenRequired } from "./with-auth-token-required";

const getMockSuccessResponse = async () => Response.OK({});

describe("middleware", () => {
  describe("withAuthTokenRequired", () => {
    let mockHandlerFn: Handler = vi.fn(getMockSuccessResponse);

    beforeEach(() => {
      mockHandlerFn = vi.fn(getMockSuccessResponse);
    });

    it("Pass request when request has token prop", async () => {
      const mockRequest = {
        context: {},
        headers: {},
        params: {
          auth_token: "token",
        },
      } as unknown as Request;

      const response = await withAuthTokenRequired(mockHandlerFn)(mockRequest);

      expect(response.status).toBe(200);
      expect(mockHandlerFn).toHaveBeenCalledOnce();
    });

    it("Reject request without auth token", async () => {
      const mockRequest = {
        context: {},
        headers: {},
        params: {},
      } as unknown as Request;

      const response = await withAuthTokenRequired(mockHandlerFn)(mockRequest);
      expect(response.status).eq(400);
      expect(mockHandlerFn).toBeCalledTimes(0);
    });
  });
});
