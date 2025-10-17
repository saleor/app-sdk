import {
  HTTPMethod,
  PlatformAdapterInterface,
} from "@/handlers/shared/generic-adapter-use-case-types";

export class MockAdapter implements PlatformAdapterInterface<unknown> {
  constructor(public config: { mockHeaders?: Record<string, string>; baseUrl?: string }) {}

  send() {
    throw new Error("Method not implemented.");
  }

  getHeader(key: string) {
    if (this.config.mockHeaders && key in this.config.mockHeaders) {
      return this.config.mockHeaders[key];
    }
    return null;
  }

  async getBody(): Promise<object | null> {
    return null;
  }

  async getRawBody(): Promise<string> {
    return "{}";
  }

  getBaseUrl() {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }
    return "";
  }

  method: HTTPMethod = "POST";

  request = {};
}
