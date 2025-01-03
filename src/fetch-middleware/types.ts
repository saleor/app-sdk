export type SaleorRequest = Request & { context?: Record<string, any> };
export type FetchHandler = (req: SaleorRequest) => Response | Promise<Response>;
export type FetchMiddleware = (handler: FetchHandler) => FetchHandler;
export type FetchPipeline = [...FetchMiddleware[], FetchHandler];
export type ReveredFetchPipeline = [FetchHandler, ...FetchMiddleware[]];
