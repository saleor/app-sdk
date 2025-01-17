import {
  ActionHandlerResult,
  PlatformAdapterInterface,
} from "@/handlers/shared/generic-adapter-use-case-types";

export type WebApiHandlerInput = Request;
export type WebApiHandler = (req: Request) => Response | Promise<Response>;

export class WebApiAdapter implements PlatformAdapterInterface<WebApiHandlerInput> {
  constructor(public request: Request) {}

  getHeader(name: string) {
    return this.request.headers.get(name);
  }

  async getBody() {
    const request = this.request.clone();
    try {
      return await request.json();
    } catch (err) {
      return null;
    }
  }

  getBaseUrl(): string {
    let url: URL | undefined;
    try {
      url = new URL(this.request.url);
    } catch (e) {
      // no-op
    }

    const host = this.request.headers.get("host");
    const xForwardedProto = this.request.headers.get("x-forwarded-proto");

    let protocol: string;
    if (xForwardedProto) {
      const xForwardedForProtocols = xForwardedProto.split(",").map((value) => value.trimStart());
      protocol = xForwardedForProtocols.find((el) => el === "https") || xForwardedForProtocols[0];
    } else if (url) {
      // Some providers (e.g. Deno Deploy)
      // do not set x-forwarded-for header when handling request
      // try to get it from URL
      protocol = url.protocol.replace(":", "");
    } else {
      protocol = "http";
    }

    return `${protocol}://${host}`;
  }

  get method() {
    return this.request.method as "POST" | "GET";
  }

  async send(result: ActionHandlerResult): Promise<Response> {
    const body = result.bodyType === "json" ? JSON.stringify(result.body) : result.body;

    return new Response(body, {
      status: result.status,
      headers: {
        "Content-Type": result.bodyType === "json" ? "application/json" : "text/plain",
      },
    });
  }
}
