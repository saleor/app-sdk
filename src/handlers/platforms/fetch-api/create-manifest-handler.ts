import { getBaseUrlFetchAPI, getSaleorHeadersFetchAPI } from "@/headers";
import { AppManifest } from "@/types";

export type CreateManifestHandlerOptions = {
  manifestFactory(context: {
    appBaseUrl: string;
    request: Request;
    /** For Saleor < 3.15 it will be null. */
    schemaVersion: number | null;
  }): AppManifest | Promise<AppManifest>;
};

export const createManifestHandler =
  (options: CreateManifestHandlerOptions) => async (request: Request) => {
    const { schemaVersion } = getSaleorHeadersFetchAPI(request.headers);
    const baseURL = getBaseUrlFetchAPI(request);

    const manifest = await options.manifestFactory({
      appBaseUrl: baseURL,
      request,
      schemaVersion,
    });

    return Response.json(manifest);
  };
