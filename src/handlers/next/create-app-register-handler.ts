import type { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { withMethod } from "retes/middleware";
import { Response } from "retes/response";

import { SALEOR_DOMAIN_HEADER } from "../../const";
import { withAuthTokenRequired, withSaleorDomainPresent } from "../../middleware";
import { HasAPL } from "../../saleor-app";

export type CreateAppRegisterHandlerOptions = HasAPL;

/**
 * Creates API handler for Next.js. Creates handler called by Saleor that registers app.
 * Hides implementation details if possible
 * In the future this will be extracted to separate sdk/next package
 */
export const createAppRegisterHandler = ({ apl }: CreateAppRegisterHandlerOptions) => {
  const baseHandler: Handler = async (request) => {
    const authToken = request.params.auth_token;
    const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;

    try {
      await apl.set({ domain: saleorDomain, token: authToken });
    } catch {
      return Response.InternalServerError({
        success: false,
        error: {
          message: "Registration failed: could not save the auth data.",
        },
      });
    }
    return Response.OK({ success: true });
  };

  return toNextHandler([
    withMethod("POST"),
    withSaleorDomainPresent,
    withAuthTokenRequired,
    baseHandler,
  ]);
};
