import { SpanKind, SpanStatusCode } from "@opentelemetry/api";

import { APL, AuthData } from "@/APL";
import { createDebug } from "@/debug";
import { getOtelTracer } from "@/open-telemetry";
import { Permission } from "@/types";
import { extractUserFromJwt, TokenUserPayload } from "@/util/extract-user-from-jwt";
import { verifyJWT } from "@/verify-jwt";

import { ActionHandlerResult, PlatformAdapterInterface } from "./generic-adapter-use-case-types";
import { SaleorRequestProcessor } from "./saleor-request-processor";

export type ProtectedHandlerConfig = {
  apl: APL;
  requiredPermissions?: Permission[];
};

export type ProtectedHandlerContext = {
  baseUrl: string;
  authData: AuthData;
  user: TokenUserPayload;
};

export type ValidationResult =
  | { result: "failure"; value: ActionHandlerResult }
  | { result: "ok"; value: ProtectedHandlerContext };

export class ProtectedActionValidator<I> {
  private debug = createDebug("ProtectedActionValidator");

  private tracer = getOtelTracer();

  constructor(private adapter: PlatformAdapterInterface<I>) {}

  private requestProcessor = new SaleorRequestProcessor(this.adapter);

  /** Validates received request if it's legitimate webhook request from Saleor
   * returns ActionHandlerResult if request is invalid and must be terminated early
   * */
  async validateRequest(config: ProtectedHandlerConfig): Promise<ValidationResult> {
    return this.tracer.startActiveSpan(
      "processSaleorProtectedHandler",
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          requiredPermissions: config.requiredPermissions,
        },
      },
      async (span): Promise<ValidationResult> => {
        this.debug("Request processing started");

        const { saleorApiUrl, authorizationBearer: token } =
          this.requestProcessor.getSaleorHeaders();

        const baseUrl = this.adapter.getBaseUrl();

        span.setAttribute("saleorApiUrl", saleorApiUrl ?? "");

        if (!baseUrl) {
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "Missing host header",
            })
            .end();

          this.debug("Missing host header");

          return {
            result: "failure",
            value: {
              bodyType: "string",
              status: 400,
              body: "Validation error: Missing host header",
            },
          };
        }

        if (!saleorApiUrl) {
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "Missing saleor-api-url header",
            })
            .end();

          this.debug("Missing saleor-api-url header");

          return {
            result: "failure",
            value: {
              bodyType: "string",
              status: 400,
              body: "Validation error: Missing saleor-api-url header",
            },
          };
        }

        if (!token) {
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "Missing authorization-bearer header",
            })
            .end();

          this.debug("Missing authorization-bearer header");

          return {
            result: "failure",
            value: {
              bodyType: "string",
              status: 400,
              body: "Validation error: Missing authorization-bearer header",
            },
          };
        }

        // Check if API URL has been registered in the APL
        const authData = await config.apl.get(saleorApiUrl);

        if (!authData) {
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "APL didn't found auth data for API URL",
            })
            .end();

          this.debug("APL didn't found auth data for API URL %s", saleorApiUrl);

          return {
            result: "failure",
            value: {
              bodyType: "string",
              status: 401,
              body: `Validation error: Can't find auth data for saleorApiUrl ${saleorApiUrl}. Please register the application`,
            },
          };
        }

        try {
          await verifyJWT({
            appId: authData.appId,
            token,
            saleorApiUrl,
            requiredPermissions: config.requiredPermissions,
          });
        } catch (e) {
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "JWT verification failed",
            })
            .end();

          return {
            result: "failure",
            value: {
              bodyType: "string",
              status: 401,
              body: "Validation error: JWT verification failed",
            },
          };
        }

        try {
          const userJwtPayload = extractUserFromJwt(token);

          span.end();
          return {
            result: "ok",
            value: {
              baseUrl,
              authData,
              user: userJwtPayload,
            },
          };
        } catch (err) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Error parsing user from JWT",
          });
          span.end();
          return {
            result: "failure",
            value: {
              bodyType: "string",
              status: 500,
              body: "Unexpected error: parsing user from JWT",
            },
          };
        }
      }
    );
  }
}
