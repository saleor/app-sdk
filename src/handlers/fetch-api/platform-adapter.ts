import {
  HandlerUseCaseResult,
  PlatformAdapterInterface,
} from "../shared/generic-adapter-use-case-types";

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

  get method() {
    return this.request.method as "POST" | "GET";
  }

  async send(result: HandlerUseCaseResult): Promise<Response> {
    const body = result.bodyType === "json" ? JSON.stringify(result.body) : result.body;

    return new Response(body, {
      status: result.status,
      headers: {
        "Content-Type": result.bodyType === "json" ? "application/json" : "text/plain",
      },
    });
  }
}
