import { NextRequest, NextResponse } from "next/server";

import { WebApiAdapter } from "@/handlers/platforms/fetch-api";

export type NextAppRouterHandlerInput = NextRequest;
export type NextAppRouterHandler = (req: NextRequest) => NextResponse | Promise<NextResponse>;

export class NextAppRouterAdapter extends WebApiAdapter<NextRequest, NextResponse> {
  constructor(public request: NextRequest) {
    super(request, NextResponse);
  }
}
