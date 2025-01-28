import { Request } from "retes";
import { Response } from "retes/response";
import { describe, expect, it } from "vitest";

import { FileAPL } from "../APL";
import { SaleorApp } from "../saleor-app";
import { withSaleorApp } from "./with-saleor-app";

describe("middleware", () => {
  describe("withSaleorApp", () => {
    it("Adds SaleorApp instance to request context", async () => {
      const mockRequest = {
        context: {},
      } as unknown as Request;

      await withSaleorApp(new SaleorApp({ apl: new FileAPL() }))((request) => {
        expect(request.context.saleorApp).toBeDefined();

        return Response.OK("");
      })(mockRequest);
    });
  });
});
