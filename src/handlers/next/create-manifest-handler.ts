import { NextApiHandler, NextApiRequest } from "next";

import { createDebug } from "../../debug";
import { getBaseUrl, getSaleorHeaders } from "../../headers";
import { AppManifest } from "../../types";

export type CreateManifestHandlerOptions = {
  manifestFactory(context: {
    appBaseUrl: string;
    request: NextApiRequest;
    /** For Saleor < 3.15 it will be null. */
    schemaVersion: number | null;
  }): AppManifest | Promise<AppManifest>;
};

const debug = createDebug("create-manifest-handler");

/**
 * Creates API handler for Next.js. Helps with Manifest creation, hides
 * implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createManifestHandler =
  (options: CreateManifestHandlerOptions): NextApiHandler =>
  async (request, response) => {
    const { schemaVersion } = getSaleorHeaders(request.headers);
    const baseURL = getBaseUrl(request.headers);

    debug("Received request with schema version \"%s\" and base URL \"%s\"", schemaVersion, baseURL);

    try {
      const manifest = await options.manifestFactory({
        appBaseUrl: baseURL,
        request,
        schemaVersion,
      });

      debug("Executed manifest file");

      return response.status(200).json(manifest);
    } catch (e) {
      debug("Error while resolving manifest: %O", e);

      return response.status(500).json({
        message: "Error resolving manifest file",
      });
    }
  };
