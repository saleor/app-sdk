import type { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { withMethod } from "retes/middleware";
import { Response } from "retes/response";

import { SALEOR_DOMAIN_HEADER } from "../../const";
import { createDebug } from "../../debug";
import { getAppId } from "../../get-app-id";
import { withAuthTokenRequired, withSaleorDomainPresent } from "../../middleware";
import { HasAPL } from "../../saleor-app";

const debug = createDebug("createAppRegisterHandler");

export type CreateAppRegisterHandlerOptions = HasAPL;

/**
 * Creates API handler for Next.js. Creates handler called by Saleor that registers app.
 * Hides implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createAppRegisterHandler = ({ apl }: CreateAppRegisterHandlerOptions) => {
  const baseHandler: Handler = async (request) => {
    debug("Request received");
    const authToken = request.params.auth_token;
    const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;

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
    const appId = await getAppId({ domain: saleorDomain, token: authToken });
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

    try {
      await apl.set({ domain: saleorDomain, token: authToken });
    } catch {
      debug("There was an error during saving the auth data");
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
