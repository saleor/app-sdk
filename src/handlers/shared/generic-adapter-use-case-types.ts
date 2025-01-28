export const HTTPMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  DELETE: "DELETE",
} as const;
export type HTTPMethod = typeof HTTPMethod[keyof typeof HTTPMethod];

/** Status code of the result, for most platforms it's mapped to HTTP status code
 * however when request is not HTTP it can be mapped to something else */
export type ResultStatusCodes = number;

/** Shape of result that should be returned from use case
 * that is then translated by adapter to a valid platform response */
export type ActionHandlerResult<Body = unknown> =
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
export interface PlatformAdapterInterface<T> {
  send(result: ActionHandlerResult): unknown;
  getHeader(name: string): string | null;
  getBody(): Promise<unknown>;
  getRawBody(): Promise<string | null>;
  getBaseUrl(): string;
  method: HTTPMethod;
  request: T;
}

/** Interfaces for use case handlers that encapsulate business logic
 * (e.g. validating headers, checking HTTP method, etc. ) */
export interface ActionHandlerInterface {
  handleAction(...params: [unknown]): Promise<ActionHandlerResult>;
}
