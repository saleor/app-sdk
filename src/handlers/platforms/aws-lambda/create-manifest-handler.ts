import {
  CreateManifestHandlerOptions as GenericHandlerOptions,
  ManifestActionHandler,
} from "@/handlers/actions/manifest-action-handler";

import { AwsLambdaAdapter, AWSLambdaHandler, AwsLambdaHandlerInput } from "./platform-adapter";

export type CreateManifestHandlerOptions = GenericHandlerOptions<AwsLambdaHandlerInput>;

/** Returns app manifest API route handler for AWS Lambda HTTP triggered events
 * (created by Amazon API Gateway, Lambda Function URL)
 * that use signature: (event: APIGatewayProxyEventV2, context: Context) => APIGatewayProxyResultV2
 *
 * App manifest is an endpoint that Saleor will call your App metadata.
 * It has the App's name and description, as well as all the necessary information to
 * register webhooks, permissions, and extensions.
 *
 * **Recommended path**: `/api/manifest`
 *
 * To learn more check Saleor docs
 * @see {@link https://docs.saleor.io/developer/extending/apps/architecture/app-requirements#manifest-url}
 * */
export const createManifestHandler =
  (config: CreateManifestHandlerOptions): AWSLambdaHandler =>
  async (event, context) => {
    const adapter = new AwsLambdaAdapter(event, context);
    const actionHandler = new ManifestActionHandler(adapter);
    const result = await actionHandler.handleAction(config);
    return adapter.send(result);
  };
