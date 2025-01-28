import {
  CreateManifestHandlerOptions as GenericCreateManifestHandlerOptions,
  ManifestActionHandler,
} from "@/handlers/actions/manifest-action-handler";

import { NextJsAdapter, NextJsHandler, NextJsHandlerInput } from "./platform-adapter";

export type CreateManifestHandlerOptions = GenericCreateManifestHandlerOptions<NextJsHandlerInput>;

/**
 * Creates API handler for Next.js page router.
 *
 * elps with Manifest creation, hides
 * implementation details if possible
 */
export const createManifestHandler =
  (options: CreateManifestHandlerOptions): NextJsHandler =>
  async (req, res) => {
    const adapter = new NextJsAdapter(req, res);
    const actionHandler = new ManifestActionHandler(adapter);
    const result = await actionHandler.handleAction(options);
    return adapter.send(result);
  };
