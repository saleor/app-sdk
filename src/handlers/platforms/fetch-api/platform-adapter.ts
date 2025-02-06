import {
  ActionHandlerResult,
  PlatformAdapterInterface,
} from "@/handlers/shared/generic-adapter-use-case-types";

export type WebApiHandlerInput = Request;
export type WebApiHandler = (req: Request) => Response | Promise<Response>;

/** PlatformAdapter for Web API (Fetch API: Request and Response)
 *
 * Platform adapters are used in Actions to handle generic request logic
 * like getting body, headers, etc.
 *
 * Thanks to this Actions logic can be re-used for each platform

 * @see {PlatformAdapterInterface}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request}
 *
 * */
export class WebApiAdapter implements PlatformAdapterInterface<WebApiHandlerInput> {
  constructor(public request: Request) {}

  getHeader(name: string) {
    return this.request.headers.get(name);
  }

  async getBody() {
    const request = this.request.clone();

    return request.json();
  }

  async getRawBody() {
    const request = this.request.clone();
    return request.text();
  }

  getBaseUrl(): string {
    const url = new URL(this.request.url); // This is safe, URL in Request object must be valid
    const host = this.request.headers.get("host");
    const xForwardedProto = this.request.headers.get("x-forwarded-proto");

    let protocol: string;
    if (xForwardedProto) {
      const xForwardedForProtocols = xForwardedProto.split(",").map((value) => value.trimStart());
      protocol =
        xForwardedForProtocols.find((el) => el === "https") ||
        xForwardedForProtocols.find((el) => el === "http") ||
        xForwardedForProtocols[0];
    } else {
      // Some providers (e.g. Deno Deploy)
      // do not set x-forwarded-for header when handling request
      // try to get it from URL
      protocol = url.protocol.replace(":", "");
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
