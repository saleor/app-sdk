import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION,
  SALEOR_SIGNATURE_HEADER,
} from "@/const";
import { createMiddlewareDebug } from "@/middleware/middleware-debug";

import {
  ActionHandlerResult,
  HTTPMethod,
  PlatformAdapterInterface,
} from "./generic-adapter-use-case-types";

const debug = createMiddlewareDebug("PlatformAdapterMiddleware");

export class PlatformAdapterMiddleware<T> {
  constructor(private adapter: PlatformAdapterInterface<T>) { }

  withMethod(methods: HTTPMethod[]): ActionHandlerResult | null {
    if (!methods.includes(this.adapter.method)) {
      return {
        body: "Method not allowed",
        bodyType: "string",
        status: 405,
      };
    }

    return null;
  }

  withSaleorApiUrlPresent(): ActionHandlerResult | null {

  }

  withSaleorDomainPresent(): ActionHandlerResult | null {
    const { domain } = this.getSaleorHeaders();
    debug("withSaleorDomainPresent middleware called with domain in header: %s", domain);

    if (!domain) {
      debug("Domain not found in header, will respond with Bad Request");

      return {
        body: "Missing Saleor domain header.",
        bodyType: "string",
        status: 400,
      };
    }

    return null;
  }

  private toStringOrUndefined = (value: string | string[] | undefined | null) =>
    value ? value.toString() : undefined;

  private toFloatOrNull = (value: string | string[] | undefined | null) =>
    value ? parseFloat(value.toString()) : null;

  getSaleorHeaders() {
    return {
      domain: this.toStringOrUndefined(this.adapter.getHeader(SALEOR_DOMAIN_HEADER)),
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
