import {
  CreateManifestHandlerOptions as GenericHandlerOptions,
  ManifestActionHandler,
} from "@/handlers/actions/manifest-action-handler";

import { WebApiAdapter, WebApiHandler, WebApiHandlerInput } from "./platform-adapter";

export type CreateManifestHandlerOptions = GenericHandlerOptions<WebApiHandlerInput>;

export const createManifestHandler =
  (config: CreateManifestHandlerOptions): WebApiHandler =>
  async (request: Request) => {
    const adapter = new WebApiAdapter(request);
    const actionHandler = new ManifestActionHandler(adapter);
    const result = await actionHandler.handleAction(config);
    return adapter.send(result);
  };
