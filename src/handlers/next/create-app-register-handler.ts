import type { Handler, Request } from "retes";
import { toNextHandler } from "retes/adapter";
import { withMethod } from "retes/middleware";
import { Response } from "retes/response";

import { SALEOR_API_URL_HEADER, SALEOR_DOMAIN_HEADER } from "../../const";
import { createDebug } from "../../debug";
import { fetchRemoteJwks } from "../../fetch-remote-jwks";
import { getAppId } from "../../get-app-id";
import { withAuthTokenRequired, withSaleorDomainPresent } from "../../middleware";
import { HasAPL } from "../../saleor-app";
import { validateAllowSaleorUrls } from "./validate-allow-saleor-urls";

const debug = createDebug("createAppRegisterHandler");

export type CreateAppRegisterHandlerOptions = HasAPL & {
  /**
   * Protect app from being registered in Saleor other than specific.
   * By default, allow everything.
   *
   * Provide array of  either a full Saleor API URL (eg. my-shop.saleor.cloud/graphql/)
   * or a function that receives a full Saleor API URL ad returns true/false.
   */
  allowedSaleorUrls?: Array<string | ((saleorApiUrl: string) => boolean)>;
  hooks?: {
    onRequestStart?(
      request: Request,
      context: {
        authToken?: string;
        saleorDomain?: string;
        saleorApiUrl?: string;
      }
    ): Promise<void>;
    onRequestVerified?(
      request: Request,
      context: {
        authToken: string;
        saleorDomain: string;
        saleorApiUrl: string;
        appId: string;
      }
    ): Promise<void>;
    onAuthAplSaved?(
      request: Request,
      context: {
        authToken: string;
        saleorDomain: string;
        saleorApiUrl: string;
        appId: string;
      }
    ): Promise<void>;
    onAuthAplFailed?(
      request: Request,
      context: {
        authToken: string;
        saleorDomain: string;
        saleorApiUrl: string;
        appId: string;
        error: unknown;
      }
    ): Promise<void>;
  };
};

/**
 * Creates API handler for Next.js. Creates handler called by Saleor that registers app.
 * Hides implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createAppRegisterHandler = ({
  apl,
  allowedSaleorUrls,
  hooks,
}: CreateAppRegisterHandlerOptions) => {
  const baseHandler: Handler = async (request) => {
    debug("Request received");
    const authToken = request.params.auth_token;
    const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;
    const saleorApiUrl = request.headers[SALEOR_API_URL_HEADER] as string;

    if (hooks?.onRequestStart) {
      await hooks.onRequestStart(request, {
        authToken,
        saleorApiUrl,
        saleorDomain,
      });
    }

    if (!validateAllowSaleorUrls(saleorApiUrl, allowedSaleorUrls)) {
      debug("Validation of URL %s against allowSaleorUrls param resolves to false, throwing");

      return Response.Forbidden({
        success: false,
        error: {
          code: "SALEOR_URL_PROHIBITED",
          message: "This app expects to be installed only in allowed saleor instances",
        },
      });
    }

    const { configured: aplConfigured } = await apl.isConfigured();

    if (!aplConfigured) {
      debug("The APL has not been configured");
      return new Response(
        {
          success: false,
          error: {
            code: "APL_NOT_CONFIGURED",
            message: "APL_NOT_CONFIGURED. App is configured properly. Check APL docs for help.",
          },
        },
        {
          status: 503,
        }
      );
    }

    // Try to get App ID from the API, to confirm that communication can be established
    const appId = await getAppId({ saleorApiUrl, token: authToken });
    if (!appId) {
      return new Response(
        {
          success: false,
          error: {
            code: "UNKNOWN_APP_ID",
            message:
              "The auth data given during registration request could not be used to fetch app ID.",
          },
        },
        {
          status: 401,
        }
      );
    }

    // Fetch the JWKS which will be used during webhook validation
    const jwks = await fetchRemoteJwks(saleorApiUrl);
    if (!jwks) {
      return new Response(
        {
          success: false,
          error: {
            code: "JWKS_NOT_AVAILABLE",
            message: "Can't fetch the remote JWKS.",
          },
        },
        {
          status: 401,
        }
      );
    }

    if (hooks?.onRequestVerified) {
      await hooks.onRequestVerified(request, {
        authToken,
        saleorApiUrl,
        appId,
        saleorDomain,
      });
    }

    try {
      await apl.set({
        domain: saleorDomain,
        token: authToken,
        saleorApiUrl,
        appId,
        jwks,
      });

      if (hooks?.onAuthAplSaved) {
        await hooks?.onAuthAplSaved(request, {
          appId,
          saleorDomain,
          saleorApiUrl,
          authToken,
        });
      }
    } catch (e: unknown) {
      debug("There was an error during saving the auth data");

      if (hooks?.onAuthAplFailed) {
        await hooks?.onAuthAplFailed(request, {
          appId,
          saleorDomain,
          saleorApiUrl,
          authToken,
          error: e,
        });
      }

      return Response.InternalServerError({
        success: false,
        error: {
          message: "Registration failed: could not save the auth data.",
        },
      });
    }

    debug("Register  complete");

    return Response.OK({ success: true });
  };

  return toNextHandler([
    withMethod("POST"),
    withSaleorDomainPresent,
    withAuthTokenRequired,
    baseHandler,
  ]);
};
