import { createDebug } from "@/debug";
import { AppManifest } from "@/types";

import { PlatformAdapterMiddleware } from "../shared/adapter-middleware";
import {
  ActionHandlerInterface,
  ActionHandlerResult,
  PlatformAdapterInterface,
} from "../shared/generic-adapter-use-case-types";

const debug = createDebug("create-manifest-handler");

export type CreateManifestHandlerOptions<T> = {
  manifestFactory(context: {
    appBaseUrl: string;
    request: T;
    /** For Saleor < 3.15 it will be null. */
    schemaVersion: number | null;
  }): AppManifest | Promise<AppManifest>;
};

export class ManifestActionHandler<I> implements ActionHandlerInterface {
  constructor(private adapter: PlatformAdapterInterface<I>) {}

  private adapterMiddleware = new PlatformAdapterMiddleware(this.adapter);

  async handleAction(options: CreateManifestHandlerOptions<I>): Promise<ActionHandlerResult> {
    const { schemaVersion } = this.adapterMiddleware.getSaleorHeaders();
    const baseURL = this.adapter.getBaseUrl();

    debug("Received request with schema version \"%s\" and base URL \"%s\"", schemaVersion, baseURL);

    try {
      const manifest = await options.manifestFactory({
        appBaseUrl: baseURL,
        request: this.adapter.request,
        schemaVersion,
      });

      debug("Executed manifest file");

      return {
        status: 200,
        bodyType: "json",
        body: manifest,
      };
    } catch (e) {
      debug("Error while resolving manifest: %O", e);

      return {
        status: 500,
        bodyType: "string",
        body: "Error resolving manifest file.",
      };
    }
  }
}
