import { NextApiHandler, NextApiRequest } from "next";

import { getBaseUrl } from "../../headers";
import { AppManifest } from "../../types";

export type CreateManifestHandlerOptions = {
  manifestFactory(context: {
    appBaseUrl: string;
    request: NextApiRequest;
  }): AppManifest | Promise<AppManifest>;
};

/**
 * Creates API handler for Next.js. Helps with Manifest creation, hides
 * implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createManifestHandler =
  (options: CreateManifestHandlerOptions): NextApiHandler =>
  async (request, response) => {
    const baseURL = getBaseUrl(request.headers);

    const manifest = await options.manifestFactory({
      appBaseUrl: baseURL,
      request,
    });

    return response.status(200).json(manifest);
  };
