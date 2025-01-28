import type { Handler, Request } from "retes";
import { toNextHandler } from "retes/adapter";
import { withMethod } from "retes/middleware";
import { Response } from "retes/response";

import { AuthData } from "../../APL";
import { SALEOR_API_URL_HEADER, SALEOR_DOMAIN_HEADER } from "../../const";
import { createDebug } from "../../debug";
import { fetchRemoteJwks } from "../../fetch-remote-jwks";
import { getAppId } from "../../get-app-id";
import { withAuthTokenRequired, withSaleorDomainPresent } from "../../middleware";
import { HasAPL } from "../../saleor-app";
import { validateAllowSaleorUrls } from "./validate-allow-saleor-urls";

const debug = createDebug("createAppRegisterHandler");

type HookCallbackErrorParams = {
  status?: number;
  message?: string;
};

class RegisterCallbackError extends Error {
  public status = 500;

  constructor(errorParams: HookCallbackErrorParams) {
    super(errorParams.message);

    if (errorParams.status) {
      this.status = errorParams.status;
    }
  }
}

const createCallbackError = (params: HookCallbackErrorParams) => {
  throw new RegisterCallbackError(params);
};

export type RegisterHandlerResponseBody = {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
  };
};
export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"]
): RegisterHandlerResponseBody => ({
  success,
  error,
});

const handleHookError = (e: RegisterCallbackError | unknown) => {
  if (e instanceof RegisterCallbackError) {
    return new Response(
      createRegisterHandlerResponseBody(false, {
        code: "REGISTER_HANDLER_HOOK_ERROR",
        message: e.message,
      }),
      { status: e.status }
    );
  }
  return Response.InternalServerError("Error during app installation");
};

export type CreateAppRegisterHandlerOptions = HasAPL & {
  /**
   * Protect app from being registered in Saleor other than specific.
   * By default, allow everything.
   *
   * Provide array of  either a full Saleor API URL (eg. my-shop.saleor.cloud/graphql/)
   * or a function that receives a full Saleor API URL ad returns true/false.
   */
  allowedSaleorUrls?: Array<string | ((saleorApiUrl: string) => boolean)>;
  /**
   * Run right after Saleor calls this endpoint
   */
  onRequestStart?(
    request: Request,
    context: {
      authToken?: string;
      saleorDomain?: string;
      saleorApiUrl?: string;
      respondWithError: typeof createCallbackError;
    }
  ): Promise<void>;
  /**
   * Run after all security checks
   */
  onRequestVerified?(
    request: Request,
    context: {
      authData: AuthData;
      respondWithError: typeof createCallbackError;
    }
  ): Promise<void>;
  /**
   * Run after APL successfully AuthData, assuming that APL.set will reject a Promise in case of error
   */
  onAuthAplSaved?(
    request: Request,
    context: {
      authData: AuthData;
      respondWithError: typeof createCallbackError;
    }
  ): Promise<void>;
  /**
   * Run after APL fails to set AuthData
   */
  onAplSetFailed?(
    request: Request,
    context: {
      authData: AuthData;
      error: unknown;
      respondWithError: typeof createCallbackError;
    }
  ): Promise<void>;
};

/**
 * Creates API handler for Next.js. Creates handler called by Saleor that registers app.
 * Hides implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createAppRegisterHandler = ({
  apl,
  allowedSaleorUrls,
  onAplSetFailed,
  onAuthAplSaved,
  onRequestVerified,
  onRequestStart,
}: CreateAppRegisterHandlerOptions) => {
  const baseHandler: Handler = async (request) => {
    debug("Request received");

    const authToken = request.params.auth_token;
    const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;
    const saleorApiUrl = request.headers[SALEOR_API_URL_HEADER] as string;

    if (onRequestStart) {
      debug("Calling \"onRequestStart\" hook");

      try {
        await onRequestStart(request, {
          authToken,
          saleorApiUrl,
          saleorDomain,
          respondWithError: createCallbackError,
        });
      } catch (e: RegisterCallbackError | unknown) {
        debug("\"onRequestStart\" hook thrown error: %o", e);

        return handleHookError(e);
      }
    }

    if (!saleorApiUrl) {
      debug("saleorApiUrl doesnt exist in headers");
    }

    if (!validateAllowSaleorUrls(saleorApiUrl, allowedSaleorUrls)) {
      debug(
        "Validation of URL %s against allowSaleorUrls param resolves to false, throwing",
        saleorApiUrl
      );

      return Response.Forbidden(
        createRegisterHandlerResponseBody(false, {
          code: "SALEOR_URL_PROHIBITED",
          message: "This app expects to be installed only in allowed Saleor instances",
        })
      );
    }

    const { configured: aplConfigured } = await apl.isConfigured();

    if (!aplConfigured) {
      debug("The APL has not been configured");

      return new Response(
        createRegisterHandlerResponseBody(false, {
          code: "APL_NOT_CONFIGURED",
          message: "APL_NOT_CONFIGURED. App is configured properly. Check APL docs for help.",
        }),
        {
          status: 503,
        }
      );
    }

    // Try to get App ID from the API, to confirm that communication can be established
    const appId = await getAppId({ saleorApiUrl, token: authToken });
    if (!appId) {
      return new Response(
        createRegisterHandlerResponseBody(false, {
          code: "UNKNOWN_APP_ID",
          message: `The auth data given during registration request could not be used to fetch app ID. 
          This usually means that App could not connect to Saleor during installation. Saleor URL that App tried to connect: ${saleorApiUrl}`,
        }),
        {
          status: 401,
        }
      );
    }

    // Fetch the JWKS which will be used during webhook validation
    const jwks = await fetchRemoteJwks(saleorApiUrl);
    if (!jwks) {
      return new Response(
        createRegisterHandlerResponseBody(false, {
          code: "JWKS_NOT_AVAILABLE",
          message: "Can't fetch the remote JWKS.",
        }),
        {
          status: 401,
        }
      );
    }

    const authData = {
      domain: saleorDomain,
      token: authToken,
      saleorApiUrl,
      appId,
      jwks,
    };

    if (onRequestVerified) {
      debug("Calling \"onRequestVerified\" hook");

      try {
        await onRequestVerified(request, {
          authData,
          respondWithError: createCallbackError,
        });
      } catch (e: RegisterCallbackError | unknown) {
        debug("\"onRequestVerified\" hook thrown error: %o", e);

        return handleHookError(e);
      }
    }

    try {
      await apl.set(authData);

      if (onAuthAplSaved) {
        debug("Calling \"onAuthAplSaved\" hook");

        try {
          await onAuthAplSaved(request, {
            authData,
            respondWithError: createCallbackError,
          });
        } catch (e: RegisterCallbackError | unknown) {
          debug("\"onAuthAplSaved\" hook thrown error: %o", e);

          return handleHookError(e);
        }
      }
    } catch (aplError: unknown) {
      debug("There was an error during saving the auth data");

      if (onAplSetFailed) {
        debug("Calling \"onAuthAplFailed\" hook");

        try {
          await onAplSetFailed(request, {
            authData,
            error: aplError,
            respondWithError: createCallbackError,
          });
        } catch (hookError: RegisterCallbackError | unknown) {
          debug("\"onAuthAplFailed\" hook thrown error: %o", hookError);

          return handleHookError(hookError);
        }
      }

      return Response.InternalServerError(
        createRegisterHandlerResponseBody(false, {
          message: "Registration failed: could not save the auth data.",
        })
      );
    }

    debug("Register  complete");

    return Response.OK(createRegisterHandlerResponseBody(true));
  };

  return toNextHandler([
    withMethod("POST"),
    withSaleorDomainPresent,
    withAuthTokenRequired,
    baseHandler,
  ]);
};
