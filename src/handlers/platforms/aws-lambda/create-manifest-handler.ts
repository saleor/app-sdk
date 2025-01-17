import {
  CreateManifestHandlerOptions as GenericHandlerOptions,
  ManifestActionHandler,
} from "@/handlers/actions/manifest-action-handler";

import { AwsLambdaAdapter, AWSLambdaHandler, AwsLambdaHandlerInput } from "./platform-adapter";

export type CreateManifestHandlerOptions = GenericHandlerOptions<AwsLambdaHandlerInput>;

export const createManifestHandler =
  (config: CreateManifestHandlerOptions): AWSLambdaHandler =>
  async (event, context) => {
    const adapter = new AwsLambdaAdapter(event, context);
    const actionHandler = new ManifestActionHandler(adapter);
    const result = await actionHandler.handleAction(config);
    return adapter.send(result);
  };
