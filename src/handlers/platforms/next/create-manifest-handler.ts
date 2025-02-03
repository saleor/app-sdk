import {
  CreateManifestHandlerOptions as GenericCreateManifestHandlerOptions,
  ManifestActionHandler,
} from "@/handlers/actions/manifest-action-handler";

import { NextJsAdapter, NextJsHandler, NextJsHandlerInput } from "./platform-adapter";

export type CreateManifestHandlerOptions = GenericCreateManifestHandlerOptions<NextJsHandlerInput>;

/** Returns app manifest API route handler for Next.js pages router
 *
 * App manifest is an endpoint that Saleor will call your App metadata.
 * It has the App's name and description, as well as all the necessary information to
 * register webhooks, permissions, and extensions.
 *
 * **Recommended path**: `/api/manifest`
 *
 * To learn more check Saleor docs
 * @see {@link https://docs.saleor.io/developer/extending/apps/architecture/app-requirements#manifest-url}
 * @see {@link https://nextjs.org/docs/pages/building-your-application/routing/api-routes}
 * */
export const createManifestHandler =
  (options: CreateManifestHandlerOptions): NextJsHandler =>
  async (req, res) => {
    const adapter = new NextJsAdapter(req, res);
    const actionHandler = new ManifestActionHandler(adapter);
    const result = await actionHandler.handleAction(options);
    return adapter.send(result);
  };
