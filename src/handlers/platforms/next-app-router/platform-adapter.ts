import { NextRequest } from "next/server";

import { WebApiAdapter } from "@/handlers/platforms/fetch-api";

export type NextAppRouterHandlerInput = NextRequest;
export type NextAppRouterHandler = (req: NextRequest) => Response | Promise<Response>;

export class NextAppRouterAdapter extends WebApiAdapter<NextRequest> {
  constructor(public request: NextRequest) {
    super(request, Response);
  }
}
