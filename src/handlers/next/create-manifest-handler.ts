import { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { Response } from "retes/response";

import { withBaseURL } from "../../middleware";
import { AppManifest } from "../../types";

export type CreateManifestHandlerOptions = {
  manifestFactory(context: { appBaseUrl: string }): AppManifest | Promise<AppManifest>;
};

/**
 * Creates API handler for Next.js. Helps with Manifest creation, hides
 * implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createManifestHandler = (options: CreateManifestHandlerOptions) => {
  const baseHandler: Handler = async (request) => {
    const { baseURL } = request.context;

    const manifest = await options.manifestFactory({
      appBaseUrl: baseURL,
    });

    return Response.OK(manifest);
  };

  return toNextHandler([withBaseURL, baseHandler]);
};
