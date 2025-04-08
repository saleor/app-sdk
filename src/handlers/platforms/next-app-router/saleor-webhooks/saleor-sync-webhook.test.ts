import { NextResponse } from "next/server.js";
import { describe, expect, it } from "vitest";

import { FileAPL } from "@/APL/file";
import { SaleorSyncWebhook } from "@/handlers/platforms/next-app-router";

describe("SaleorSyncWebhook (Next App Router)", () => {
  it("Constructs (and types are right)", () => {
    /**
     * This test doesn't test anything in the runtime.
     * It's meant to ensure types are correct. If types are wrong, the project will not compile.
     */
    expect.assertions(0);

    const handler = new SaleorSyncWebhook<{ foo: string }>({
      apl: new FileAPL(),
      event: "CHECKOUT_CALCULATE_TAXES",
      name: "asd",
      query: "{}",
      webhookPath: "/",
    });

    handler.createHandler((req, ctx) => {
      const { body } = req;

      const { event } = ctx;

      return NextResponse.json({
        event,
        body,
      });
    });
  });
});
