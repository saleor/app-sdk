import { NextApiRequest, NextApiResponse } from "next";

import {
  ActionHandlerResult,
  PlatformAdapterInterface,
} from "@/handlers/shared/generic-adapter-use-case-types";

export type NextJsHandlerInput = NextApiRequest;
export type NextJsHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<ActionHandlerResult>;

export class NextJsAdapter implements PlatformAdapterInterface<NextJsHandlerInput> {
  readonly type = "next" as const;

  constructor(public request: NextApiRequest, private res: NextApiResponse) {}

  getHeader(name: string) {
    const header = this.request.headers[name];
    return Array.isArray(header) ? header.join(", ") : header ?? null;
  }

  getBody(): Promise<unknown> {
    return Promise.resolve(this.request.body);
  }

  get method() {
    return this.request.method as "POST" | "GET";
  }

  async send(result: ActionHandlerResult): Promise<void> {
    if (result.bodyType === "json") {
      this.res.status(result.status).json(result.body);
    } else {
      this.res.status(result.status).send(result.body);
    }
  }
}
