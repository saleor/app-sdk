import { AwsLambdaHandlerInput } from "../aws-lambda/platform-adapter";
import { WebApiHandlerInput } from "../fetch-api/platform-adapter";
import { NextJsHandlerInput } from "../next/platform-adapter";

/** Status code of the result, for most platforms it's mapped to HTTP status code
 * however when request is not HTTP it can be mapped to something else */
export type ResultStatusCodes = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 503;

/** Shape of result that should be returned from use case
 * that is then translated by adapter to a valid platform response */
export type HandlerUseCaseResult<Body = unknown> =
  | {
      status: ResultStatusCodes;
      body: Body;
      bodyType: "json";
    }
  | {
      status: ResultStatusCodes;
      body: string;
      bodyType: "string";
    };

/**
 * Interface for adapters that translate specific platform objects (e.g. Web API, Next.js)
 * into a common interface that can be used in each handler use case
 * */
export interface PlatformAdapterInterface<T extends HandlerInput> {
  send(result: HandlerUseCaseResult): unknown;
  getHeader(name: string): string | null;
  getBody(): Promise<unknown>;
  method: string;
  request: T;
}

/** Interfaces for use case handlers that encapsulate business logic
 * (e.g. validating headers, checking HTTP method, etc. ) */
export interface HandlerUseCaseInterface {
  getResult(): Promise<HandlerUseCaseResult>;
}

export type HandlerInput = NextJsHandlerInput | WebApiHandlerInput | AwsLambdaHandlerInput;
