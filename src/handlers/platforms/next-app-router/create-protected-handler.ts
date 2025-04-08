import { NextRequest, NextResponse } from "next/server.js";

import { APL } from "@/APL";
import {
  ProtectedActionValidator,
  ProtectedHandlerContext,
} from "@/handlers/shared/protected-action-validator";
import { Permission } from "@/types";

import { NextAppRouterAdapter, NextAppRouterHandler } from "./platform-adapter";

export type NextAppRouterProtectedHandler = (
  request: NextRequest,
  ctx: ProtectedHandlerContext,
) => Response | Promise<Response>;

export const createProtectedHandler =
  (
    handlerFn: NextAppRouterProtectedHandler,
    apl: APL,
    requiredPermissions?: Permission[],
  ): NextAppRouterHandler =>
  async (request) => {
    const adapter = new NextAppRouterAdapter(request);
    const actionValidator = new ProtectedActionValidator(adapter);
    const validationResult = await actionValidator.validateRequest({
      apl,
      requiredPermissions,
    });

    if (validationResult.result === "failure") {
      return adapter.send(validationResult.value);
    }

    const context = validationResult.value;
    try {
      return await handlerFn(request, context);
    } catch (err) {
      return new NextResponse("Unexpected server error", { status: 500 });
    }
  };
