import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";

import {
  ActionHandlerResult,
  PlatformAdapterInterface,
} from "@/handlers/shared/generic-adapter-use-case-types";

export type NextJsHandlerInput = NextApiRequest;
export type NextJsHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export class NextJsAdapter implements PlatformAdapterInterface<NextJsHandlerInput> {
  readonly type = "next" as const;

  constructor(public request: NextApiRequest, private res: NextApiResponse) { }

  getHeader(name: string) {
    const header = this.request.headers[name];
    return Array.isArray(header) ? header.join(", ") : header ?? null;
  }

  getBody(): Promise<unknown> {
    return Promise.resolve(this.request.body);
  }

  async getRawBody(): Promise<string> {
    return (
      await getRawBody(this.request, {
        length: this.request.headers["content-length"],
      })
    ).toString();
  }

  getBaseUrl(): string {
    const { host, "x-forwarded-proto": xForwardedProto = "http" } = this.request.headers;

    const xForwardedProtos = Array.isArray(xForwardedProto)
      ? xForwardedProto.join(",")
      : xForwardedProto;
    const protocols = xForwardedProtos.split(",");
    // prefer https over other protocols
    const protocol = protocols.find((el) => el === "https") || protocols[0];

    return `${protocol}://${host}`;
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
