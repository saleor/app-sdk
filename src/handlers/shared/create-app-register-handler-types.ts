import { AuthData } from "../../APL";
import { HasAPL } from "../../saleor-app";

export type HookCallbackErrorParams = {
  status?: number;
  message?: string;
};

export type CallbackErrorHandler = (params: HookCallbackErrorParams) => never;

export type GenericCreateAppRegisterHandlerOptions<RequestType> = HasAPL & {
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
    request: RequestType,
    context: {
      authToken?: string;
      saleorApiUrl?: string;
      respondWithError: CallbackErrorHandler;
    },
  ): Promise<void>;
  /**
   * Run after all security checks
   */
  onRequestVerified?(
    request: RequestType,
    context: {
      authData: AuthData;
      respondWithError: CallbackErrorHandler;
    },
  ): Promise<void>;
  /**
   * Run after APL successfully AuthData, assuming that APL.set will reject a Promise in case of error
   */
  onAuthAplSaved?(
    request: RequestType,
    context: {
      authData: AuthData;
      respondWithError: CallbackErrorHandler;
    },
  ): Promise<void>;
  /**
   * Run after APL fails to set AuthData
   */
  onAplSetFailed?(
    request: RequestType,
    context: {
      authData: AuthData;
      error: unknown;
      respondWithError: CallbackErrorHandler;
    },
  ): Promise<void>;
};
