/* eslint-disable max-classes-per-file */
import { AuthData } from "../../APL";
import { SALEOR_API_URL_HEADER, SALEOR_DOMAIN_HEADER } from "../../const";
import { createDebug } from "../../debug";
import { fetchRemoteJwks } from "../../fetch-remote-jwks";
import { getAppId } from "../../get-app-id";
import { HasAPL } from "../../saleor-app";
import { PlatformAdapterMiddleware } from "./adapter-middleware";
import {
  HandlerInput,
  HandlerUseCaseInterface,
  HandlerUseCaseResult,
  PlatformAdapterInterface,
  ResultStatusCodes,
} from "./generic-adapter-use-case-types";
import { validateAllowSaleorUrls } from "./validate-allow-saleor-urls";

const debug = createDebug("createAppRegisterHandler");

// TODO: Make this private methods?
// Copy pasted from existing manifest handler
class RegisterCallbackError extends Error {
  public status: ResultStatusCodes = 500;

  constructor(errorParams: HookCallbackErrorParams) {
    super(errorParams.message);

    if (errorParams.status) {
      this.status = errorParams.status;
    }
  }
}

export type RegisterHandlerResponseBody = {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
  };
};

export const createRegisterHandlerResponseBody = (
  success: boolean,
  error?: RegisterHandlerResponseBody["error"],
  statusCode?: ResultStatusCodes
): HandlerUseCaseResult<RegisterHandlerResponseBody> => ({
  status: statusCode ?? (success ? 200 : 500),
  body: {
    success,
    error,
  },
  bodyType: "json",
});

const handleHookError = (e: RegisterCallbackError | unknown): HandlerUseCaseResult => {
  if (e instanceof RegisterCallbackError) {
    return createRegisterHandlerResponseBody(false, {
      code: "REGISTER_HANDLER_HOOK_ERROR",
      message: e.message,
    });
  }
  return {
    status: 500,
    body: "Error during app installation",
    bodyType: "string",
  };
};

const createCallbackError: CallbackErrorHandler = (params: HookCallbackErrorParams) => {
  throw new RegisterCallbackError(params);
};

export type HookCallbackErrorParams = {
  status?: ResultStatusCodes;
  message?: string;
};

export type CallbackErrorHandler = (params: HookCallbackErrorParams) => never;

export type GenericCreateAppRegisterHandlerOptions<Request = HandlerInput> = HasAPL & {
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
      respondWithError: CallbackErrorHandler;
    }
  ): Promise<void>;
  /**
   * Run after all security checks
   */
  onRequestVerified?(
    request: Request,
    context: {
      authData: AuthData;
      respondWithError: CallbackErrorHandler;
    }
  ): Promise<void>;
  /**
   * Run after APL successfully AuthData, assuming that APL.set will reject a Promise in case of error
   */
  onAuthAplSaved?(
    request: Request,
    context: {
      authData: AuthData;
      respondWithError: CallbackErrorHandler;
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
      respondWithError: CallbackErrorHandler;
    }
  ): Promise<void>;
};

export class RegisterUseCase<I extends HandlerInput> implements HandlerUseCaseInterface {
  private adapter: PlatformAdapterInterface<I>;

  private adapterMiddleware: PlatformAdapterMiddleware;

  public config: GenericCreateAppRegisterHandlerOptions<I>;

  constructor({
    adapter,
    config,
  }: {
    adapter: PlatformAdapterInterface<I>;
    config: GenericCreateAppRegisterHandlerOptions<I>;
  }) {
    this.adapter = adapter;
    this.adapterMiddleware = new PlatformAdapterMiddleware(adapter);
    this.config = config;
  }

  private runPreChecks(): HandlerUseCaseResult | null {
    const checksToRun = [
      this.adapterMiddleware.withMethod(["POST"]),
      this.adapterMiddleware.withSaleorDomainPresent(),
    ];

    for (const check of checksToRun) {
      if (check) {
        return check;
      }
    }

    return null;
  }

  /** TODO: Add missing retes methods:
   * withMethod("POST"),
   * withSaleorDomainPresent,
   * withAuthTokenRequired,
   * baseHandler,
   * */
  async getResult(): Promise<HandlerUseCaseResult> {
    debug("Request received");

    const precheckResult = this.runPreChecks();
    if (precheckResult) {
      return precheckResult;
    }

    const saleorDomain = this.adapter.getHeader(SALEOR_DOMAIN_HEADER) as string;
    const saleorApiUrl = this.adapter.getHeader(SALEOR_API_URL_HEADER) as string;

    let body: { auth_token: string };
    try {
      body = (await this.adapter.getBody()) as { auth_token: string };
    } catch (err) {
      // TODO: Handle error
      throw new Error("Cannot parse body");
    }

    const authToken = body.auth_token;

    if (!authToken) {
      debug("Found missing authToken param");

      return {
        status: 400,
        body: "Missing auth token.",
        bodyType: "string",
      };
    }

    if (this.config.onRequestStart) {
      debug("Calling \"onRequestStart\" hook");

      try {
        await this.config.onRequestStart(this.adapter.request, {
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
      debug("saleorApiUrl doesn't exist in headers");
    }

    if (!validateAllowSaleorUrls(saleorApiUrl, this.config.allowedSaleorUrls)) {
      debug(
        "Validation of URL %s against allowSaleorUrls param resolves to false, throwing",
        saleorApiUrl
      );

      return createRegisterHandlerResponseBody(
        false,
        {
          code: "SALEOR_URL_PROHIBITED",
          message: "This app expects to be installed only in allowed Saleor instances",
        },
        403
      );
    }

    const { configured: aplConfigured } = await this.config.apl.isConfigured();

    if (!aplConfigured) {
      debug("The APL has not been configured");

      return createRegisterHandlerResponseBody(
        false,
        {
          code: "APL_NOT_CONFIGURED",
          message: "APL_NOT_CONFIGURED. App is configured properly. Check APL docs for help.",
        },
        503
      );
    }

    // Try to get App ID from the API, to confirm that communication can be established
    const appId = await getAppId({ saleorApiUrl, token: authToken });
    if (!appId) {
      return createRegisterHandlerResponseBody(
        false,
        {
          code: "UNKNOWN_APP_ID",
          message: `The auth data given during registration request could not be used to fetch app ID. 
          This usually means that App could not connect to Saleor during installation. Saleor URL that App tried to connect: ${saleorApiUrl}`,
        },
        401
      );
    }

    // Fetch the JWKS which will be used during webhook validation
    const jwks = await fetchRemoteJwks(saleorApiUrl);
    if (!jwks) {
      return createRegisterHandlerResponseBody(
        false,
        {
          code: "JWKS_NOT_AVAILABLE",
          message: "Can't fetch the remote JWKS.",
        },
        401
      );
    }

    const authData = {
      domain: saleorDomain,
      token: authToken,
      saleorApiUrl,
      appId,
      jwks,
    };

    if (this.config.onRequestVerified) {
      debug("Calling \"onRequestVerified\" hook");

      try {
        await this.config.onRequestVerified(this.adapter.request, {
          authData,
          respondWithError: createCallbackError,
        });
      } catch (e: RegisterCallbackError | unknown) {
        debug("\"onRequestVerified\" hook thrown error: %o", e);

        return handleHookError(e);
      }
    }

    try {
      await this.config.apl.set(authData);

      if (this.config.onAuthAplSaved) {
        debug("Calling \"onAuthAplSaved\" hook");

        try {
          await this.config.onAuthAplSaved(this.adapter.request, {
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

      if (this.config.onAplSetFailed) {
        debug("Calling \"onAuthAplFailed\" hook");

        try {
          await this.config.onAplSetFailed(this.adapter.request, {
            authData,
            error: aplError,
            respondWithError: createCallbackError,
          });
        } catch (hookError: RegisterCallbackError | unknown) {
          debug("\"onAuthAplFailed\" hook thrown error: %o", hookError);

          return handleHookError(hookError);
        }
      }

      return createRegisterHandlerResponseBody(false, {
        message: "Registration failed: could not save the auth data.",
      });
    }

    debug("Register  complete");

    return createRegisterHandlerResponseBody(true);
  }
}
