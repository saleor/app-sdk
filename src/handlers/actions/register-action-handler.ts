/* eslint-disable max-classes-per-file */
import { APL, AuthData } from "@/APL";
import { fetchRemoteJwks } from "@/auth/fetch-remote-jwks";
import { createDebug } from "@/debug";
import { getAppId } from "@/get-app-id";
import { SALEOR_API_URL_HEADER } from "@/headers";

import { GenericCreateAppRegisterHandlerOptions } from "../shared";
import {
  ActionHandlerInterface,
  ActionHandlerResult,
  PlatformAdapterInterface,
  ResultStatusCodes,
} from "../shared/generic-adapter-use-case-types";
import { SaleorRequestProcessor } from "../shared/saleor-request-processor";
import { validateAllowSaleorUrls } from "../shared/validate-allow-saleor-urls";

const debug = createDebug("createAppRegisterHandler");

/** Error raised by async handlers passed by
 * users in config to Register handler */
class RegisterCallbackError extends Error {
  public status: ResultStatusCodes = 500;

  constructor(errorParams: HookCallbackErrorParams) {
    super(errorParams.message);

    if (errorParams.status) {
      this.status = errorParams.status;
    }
  }
}

export type RegisterErrorCode =
  | "SALEOR_URL_PROHIBITED"
  | "APL_NOT_CONFIGURED"
  | "UNKNOWN_APP_ID"
  | "JWKS_NOT_AVAILABLE"
  | "REGISTER_HANDLER_HOOK_ERROR";

export type RegisterHandlerResponseBody = {
  success: boolean;
  error?: {
    code?: RegisterErrorCode;
    message?: string;
  };
};

export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"],
  statusCode?: ResultStatusCodes,
): ActionHandlerResult<RegisterHandlerResponseBody> => ({
  status: statusCode ?? (success ? 200 : 500),
  body: {
    success,
    error,
  },
  bodyType: "json",
});

export type HookCallbackErrorParams = {
  status?: ResultStatusCodes;
  message?: string;
};

export type CallbackErrorHandler = (params: HookCallbackErrorParams) => never;

export class RegisterActionHandler<I>
  implements ActionHandlerInterface<RegisterHandlerResponseBody>
{
  constructor(private adapter: PlatformAdapterInterface<I>) {}

  private requestProcessor = new SaleorRequestProcessor(this.adapter);

  private runPreChecks(): ActionHandlerResult<RegisterHandlerResponseBody> | null {
    const checksToRun = [
      this.requestProcessor.withMethod(["POST"]),
      this.requestProcessor.withSaleorApiUrlPresent(),
    ];

    for (const check of checksToRun) {
      if (check) {
        return check;
      }
    }

    return null;
  }

  async handleAction(
    config: GenericCreateAppRegisterHandlerOptions<I>,
  ): Promise<ActionHandlerResult<RegisterHandlerResponseBody>> {
    debug("Request received");

    const precheckResult = this.runPreChecks();
    if (precheckResult) {
      return precheckResult;
    }

    const saleorApiUrl = this.adapter.getHeader(SALEOR_API_URL_HEADER) as string;

    const authTokenResult = await this.parseRequestBody();

    if (!authTokenResult.success) {
      return authTokenResult.response;
    }

    const { authToken } = authTokenResult;

    const handleOnRequestResult = await this.handleOnRequestStartCallback(config.onRequestStart, {
      authToken,
      saleorApiUrl,
    });

    if (handleOnRequestResult) {
      return handleOnRequestResult;
    }

    const saleorApiUrlValidationResult = this.handleSaleorApiUrlValidation({
      saleorApiUrl,
      allowedSaleorUrls: config.allowedSaleorUrls,
    });

    if (saleorApiUrlValidationResult) {
      return saleorApiUrlValidationResult;
    }

    const aplCheckResult = await this.checkAplIsConfigured(config.apl);

    if (aplCheckResult) {
      return aplCheckResult;
    }

    const getAppIdResult = await this.getAppIdAndHandleMissingAppId({
      saleorApiUrl,
      token: authToken,
    });

    if (!getAppIdResult.success) {
      return getAppIdResult.responseBody;
    }

    const { appId } = getAppIdResult;

    const getJwksResult = await this.getJwksAndHandleMissingJwks({ saleorApiUrl });

    if (!getJwksResult.success) {
      return getJwksResult.responseBody;
    }

    const { jwks } = getJwksResult;

    const authData = {
      token: authToken,
      saleorApiUrl,
      appId,
      jwks,
    };

    const onRequestVerifiedErrorResponse = await this.handleOnRequestVerifiedCallback(
      config.onRequestVerified,
      authData,
    );

    if (onRequestVerifiedErrorResponse) {
      return onRequestVerifiedErrorResponse;
    }

    const aplSaveResponse = await this.saveAplAuthData({
      apl: config.apl,
      authData,
      onAplSetFailed: config.onAplSetFailed,
      onAuthAplSaved: config.onAuthAplSaved,
    });

    return aplSaveResponse;
  }

  private async parseRequestBody(): Promise<
    | {
        success: false;
        response: ActionHandlerResult<RegisterHandlerResponseBody>;
        authToken?: never;
      }
    | {
        success: true;
        authToken: string;
        response?: never;
      }
  > {
    let body: { auth_token: string };
    try {
      body = (await this.adapter.getBody()) as { auth_token: string };
    } catch (err) {
      return {
        success: false,
        response: {
          status: 400,
          body: "Invalid request json.",
          bodyType: "string",
        },
      };
    }

    const authToken = body?.auth_token;

    if (!authToken) {
      debug("Found missing authToken param");

      return {
        success: false,
        response: {
          status: 400,
          body: "Missing auth token.",
          bodyType: "string",
        },
      };
    }

    return {
      success: true,
      authToken,
    };
  }

  private async handleOnRequestStartCallback(
    onRequestStart: GenericCreateAppRegisterHandlerOptions<I>["onRequestStart"],
    { authToken, saleorApiUrl }: { authToken: string; saleorApiUrl: string },
  ) {
    if (onRequestStart) {
      debug("Calling \"onRequestStart\" hook");

      try {
        await onRequestStart(this.adapter.request, {
          authToken,
          saleorApiUrl,
          respondWithError: this.createCallbackError,
        });
      } catch (e: RegisterCallbackError | unknown) {
        debug("\"onRequestStart\" hook thrown error: %o", e);

        return this.handleHookError(e);
      }
    }

    return null;
  }

  private handleSaleorApiUrlValidation({
    saleorApiUrl,
    allowedSaleorUrls,
  }: {
    saleorApiUrl: string;
    allowedSaleorUrls: GenericCreateAppRegisterHandlerOptions<I>["allowedSaleorUrls"];
  }) {
    if (!validateAllowSaleorUrls(saleorApiUrl, allowedSaleorUrls)) {
      debug(
        "Validation of URL %s against allowSaleorUrls param resolves to false, throwing",
        saleorApiUrl,
      );

      return createRegisterHandlerResponseBody(
        false,
        {
          code: "SALEOR_URL_PROHIBITED",
          message: "This app expects to be installed only in allowed Saleor instances",
        },
        403,
      );
    }

    return null;
  }

  private async checkAplIsConfigured(apl: GenericCreateAppRegisterHandlerOptions<I>["apl"]) {
    /**
     * Method is optional so if not implemented, just ignore this flow
     */
    if (!apl.isConfigured) {
      return null;
    }

    const { configured: aplConfigured } = await apl.isConfigured();

    if (!aplConfigured) {
      debug("The APL has not been configured");

      return createRegisterHandlerResponseBody(
        false,
        {
          code: "APL_NOT_CONFIGURED",
          message: "APL_NOT_CONFIGURED. App is configured properly. Check APL docs for help.",
        },
        503,
      );
    }

    return null;
  }

  private async getAppIdAndHandleMissingAppId({
    saleorApiUrl,
    token,
  }: {
    saleorApiUrl: string;
    token: string;
  }): Promise<
    | {
        success: false;
        responseBody: ActionHandlerResult<RegisterHandlerResponseBody>;
      }
    | { success: true; appId: string }
  > {
    // Try to get App ID from the API, to confirm that communication can be established
    const appId = await getAppId({ saleorApiUrl, token });

    if (!appId) {
      const responseBody = createRegisterHandlerResponseBody(
        false,
        {
          code: "UNKNOWN_APP_ID",
          message: `The auth data given during registration request could not be used to fetch app ID. 
          This usually means that App could not connect to Saleor during installation. Saleor URL that App tried to connect: ${saleorApiUrl}`,
        },
        401,
      );

      return { success: false, responseBody };
    }

    return { success: true, appId };
  }

  private async getJwksAndHandleMissingJwks({ saleorApiUrl }: { saleorApiUrl: string }): Promise<
    | {
        success: false;
        responseBody: ActionHandlerResult<RegisterHandlerResponseBody>;
      }
    | { success: true; jwks: string }
  > {
    // Fetch the JWKS which will be used during webhook validation
    try {
      const jwks = await fetchRemoteJwks(saleorApiUrl);
      if (jwks) {
        return { success: true, jwks };
      }
    } catch (err) {
      // no-op - will return result below
    }

    const responseBody = createRegisterHandlerResponseBody(
      false,
      {
        code: "JWKS_NOT_AVAILABLE",
        message: "Can't fetch the remote JWKS.",
      },
      401,
    );

    return { success: false, responseBody };
  }

  private async handleOnRequestVerifiedCallback(
    onRequestVerified: GenericCreateAppRegisterHandlerOptions<I>["onRequestVerified"],
    authData: AuthData,
  ) {
    if (onRequestVerified) {
      debug("Calling \"onRequestVerified\" hook");

      try {
        await onRequestVerified(this.adapter.request, {
          authData,
          respondWithError: this.createCallbackError,
        });
      } catch (e: RegisterCallbackError | unknown) {
        debug("\"onRequestVerified\" hook thrown error: %o", e);

        return this.handleHookError(e);
      }
    }

    return null;
  }

  private async saveAplAuthData({
    apl,
    onAplSetFailed,
    onAuthAplSaved,
    authData,
  }: {
    apl: APL;
    onAplSetFailed: GenericCreateAppRegisterHandlerOptions<I>["onAplSetFailed"];
    onAuthAplSaved: GenericCreateAppRegisterHandlerOptions<I>["onAuthAplSaved"];
    authData: AuthData;
  }) {
    try {
      await apl.set(authData);

      if (onAuthAplSaved) {
        debug("Calling \"onAuthAplSaved\" hook");

        try {
          await onAuthAplSaved(this.adapter.request, {
            authData,
            respondWithError: this.createCallbackError,
          });
        } catch (e: RegisterCallbackError | unknown) {
          debug("\"onAuthAplSaved\" hook thrown error: %o", e);

          return this.handleHookError(e);
        }
      }
    } catch (aplError: unknown) {
      debug("There was an error during saving the auth data");

      if (onAplSetFailed) {
        debug("Calling \"onAuthAplFailed\" hook");

        try {
          await onAplSetFailed(this.adapter.request, {
            authData,
            error: aplError,
            respondWithError: this.createCallbackError,
          });
        } catch (hookError: RegisterCallbackError | unknown) {
          debug("\"onAuthAplFailed\" hook thrown error: %o", hookError);

          return this.handleHookError(hookError);
        }
      }

      return createRegisterHandlerResponseBody(false, {
        message: "Registration failed: could not save the auth data.",
      });
    }

    debug("Register  complete");
    return createRegisterHandlerResponseBody(true);
  }

  /** Callbacks declared by users in configuration can throw an error
   * It is caught here and converted into a response */
  private handleHookError(
    e: RegisterCallbackError | unknown,
  ): ActionHandlerResult<RegisterHandlerResponseBody> {
    if (e instanceof RegisterCallbackError) {
      return createRegisterHandlerResponseBody(
        false,
        {
          code: "REGISTER_HANDLER_HOOK_ERROR",
          message: e.message,
        },
        e.status,
      );
    }
    return {
      status: 500,
      body: "Error during app installation",
      bodyType: "string",
    };
  }

  private createCallbackError: CallbackErrorHandler = (params: HookCallbackErrorParams) => {
    throw new RegisterCallbackError(params);
  };
}
