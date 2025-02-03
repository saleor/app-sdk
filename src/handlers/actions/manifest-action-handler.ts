import { createDebug } from "@/debug";
import { AppManifest } from "@/types";

import {
  ActionHandlerInterface,
  ActionHandlerResult,
  PlatformAdapterInterface,
} from "../shared/generic-adapter-use-case-types";
import { SaleorRequestProcessor } from "../shared/saleor-request-processor";

const debug = createDebug("create-manifest-handler");

export type CreateManifestHandlerOptions<T> = {
  manifestFactory(context: {
    appBaseUrl: string;
    request: T;
    /** Added in Saleor 3.15 */
    schemaVersion: number;
  }): AppManifest | Promise<AppManifest>;
};

export class ManifestActionHandler<I> implements ActionHandlerInterface {
  constructor(private adapter: PlatformAdapterInterface<I>) {}

  private requestProcessor = new SaleorRequestProcessor(this.adapter);

  async handleAction(options: CreateManifestHandlerOptions<I>): Promise<ActionHandlerResult> {
    const { schemaVersion } = this.requestProcessor.getSaleorHeaders();
    const baseURL = this.adapter.getBaseUrl();

    debug("Received request with schema version \"%s\" and base URL \"%s\"", schemaVersion, baseURL);

    const invalidMethodResponse = this.requestProcessor.withMethod(["GET"]);

    if (invalidMethodResponse) {
      return invalidMethodResponse;
    }

    if (!schemaVersion) {
      return {
        status: 400,
        bodyType: "string",
        body: "Missing schema version header",
      };
    }

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
