import { FetchHandler, FetchPipeline, ReveredFetchPipeline } from "./types";

const isPipeline = (maybePipeline: unknown): maybePipeline is FetchPipeline =>
  Array.isArray(maybePipeline);

const compose =
  <T extends Function>(...functions: T[]) =>
  (args: any) =>
    functions.reduce((arg, fn) => fn(arg), args);

const preparePipeline = (pipeline: FetchPipeline): FetchHandler => {
  const [action, ...middleware] = pipeline.reverse() as ReveredFetchPipeline;
  return compose(...middleware)(action);
};

export const toRequestHandler = (flow: FetchHandler | FetchPipeline): FetchHandler => {
  const handler = isPipeline(flow) ? preparePipeline(flow) : flow;

  return async (request: Request) => handler(request);
};
