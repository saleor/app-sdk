import { NextRequest } from "next/server";

import {
  CreateManifestHandlerOptions as GenericHandlerOptions,
  ManifestActionHandler,
} from "@/handlers/actions/manifest-action-handler";

import {
  NextAppRouterAdapter,
  NextAppRouterHandler,
  NextAppRouterHandlerInput,
} from "./platform-adapter";

export type CreateManifestHandlerOptions = GenericHandlerOptions<NextAppRouterHandlerInput>;

/** Returns app manifest API route handler for Web API compatible request handlers
 * (examples: Next.js app router, hono, deno, etc.)
 * that use signature: (req: Request) => Response
 * where Request and Response are Fetch API objects
 *
 * App manifest is an endpoint that Saleor will call your App metadata.
 * It has the App's name and description, as well as all the necessary information to
 * register webhooks, permissions, and extensions.
 *
 * **Recommended path**: `/api/manifest`
 *
 * To learn more check Saleor docs
 * @see {@link https://docs.saleor.io/developer/extending/apps/architecture/app-requirements#manifest-url}
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request}
 * */
export const createManifestHandler =
  (config: CreateManifestHandlerOptions): NextAppRouterHandler =>
  async (request: NextRequest) => {
    const adapter = new NextAppRouterAdapter(request);
    const actionHandler = new ManifestActionHandler(adapter);
    const result = await actionHandler.handleAction(config);
    return adapter.send(result);
  };
