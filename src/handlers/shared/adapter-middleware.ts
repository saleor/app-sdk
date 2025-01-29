import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION,
  SALEOR_SIGNATURE_HEADER,
} from "@/const";

import {
  ActionHandlerResult,
  HTTPMethod,
  PlatformAdapterInterface,
} from "./generic-adapter-use-case-types";

export class PlatformAdapterMiddleware<T> {
  constructor(private adapter: PlatformAdapterInterface<T>) { }

  withMethod(methods: HTTPMethod[]) {
    if (!methods.includes(this.adapter.method)) {
      return {
        body: "Method not allowed",
        bodyType: "string",
        status: 405,
      } as const satisfies ActionHandlerResult;
    }

    return null;
  }

  withSaleorApiUrlPresent() {
    const { saleorApiUrl } = this.getSaleorHeaders();

    if (!saleorApiUrl) {
      return {
        body: "Missing saleor-api-url header",
        bodyType: "string",
        status: 400,
      } as const satisfies ActionHandlerResult;
    }

    return null;
  }


  private toStringOrUndefined = (value: string | string[] | undefined | null) =>
    value ? value.toString() : undefined;

  private toFloatOrNull = (value: string | string[] | undefined | null) =>
    value ? parseFloat(value.toString()) : null;

  getSaleorHeaders() {
    return {
      authorizationBearer: this.toStringOrUndefined(
        this.adapter.getHeader(SALEOR_AUTHORIZATION_BEARER_HEADER)
      ),
      signature: this.toStringOrUndefined(this.adapter.getHeader(SALEOR_SIGNATURE_HEADER)),
      event: this.toStringOrUndefined(this.adapter.getHeader(SALEOR_EVENT_HEADER)),
      saleorApiUrl: this.toStringOrUndefined(this.adapter.getHeader(SALEOR_API_URL_HEADER)),
      schemaVersion: this.toFloatOrNull(this.adapter.getHeader(SALEOR_SCHEMA_VERSION)),
    };
  }
}
