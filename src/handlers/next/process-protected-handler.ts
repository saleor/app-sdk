import { NextApiRequest } from "next";

import { APL } from "../../APL";
import { AuthData } from "../../APL/apl";
import { createDebug } from "../../debug";
import { getAppId } from "../../get-app-id";
import { getBaseUrl, getSaleorHeaders } from "../../headers";
import { verifyJWT } from "../../verify-jwt";

const debug = createDebug("processProtectedHandler");

export type SaleorProtectedHandlerError =
  | "OTHER"
  | "MISSING_HOST_HEADER"
  | "MISSING_DOMAIN_HEADER"
  | "MISSING_AUTHORIZATION_BEARER_HEADER"
  | "NOT_REGISTERED"
  | "JWT_VERIFICATION_FAILED"
  | "NO_APP_ID";

export class ProtectedHandlerError extends Error {
  errorType: SaleorProtectedHandlerError = "OTHER";

  constructor(message: string, errorType: SaleorProtectedHandlerError) {
    super(message);
    if (errorType) {
      this.errorType = errorType;
    }
    Object.setPrototypeOf(this, ProtectedHandlerError.prototype);
  }
}

export type ProtectedHandlerContext = {
  baseUrl: string;
  authData: AuthData;
};

interface ProcessSaleorProtectedHandlerArgs {
  req: NextApiRequest;
  apl: APL;
}

type ProcessAsyncSaleorProtectedHandler = (
  props: ProcessSaleorProtectedHandlerArgs
) => Promise<ProtectedHandlerContext>;

/**
 * Perform security checks on given request and return ProtectedHandlerContext object.
 * In case of validation issues, instance of the ProtectedHandlerError will be thrown.
 */
export const processSaleorProtectedHandler: ProcessAsyncSaleorProtectedHandler = async ({
  req,
  apl,
}: ProcessSaleorProtectedHandlerArgs): Promise<ProtectedHandlerContext> => {
  debug("Request processing started");
  const { domain, authorizationBearer: token } = getSaleorHeaders(req.headers);

  const baseUrl = getBaseUrl(req.headers);
  if (!baseUrl) {
    debug("Missing host header");
    throw new ProtectedHandlerError("Missing host header", "MISSING_HOST_HEADER");
  }

  if (!domain) {
    debug("Missing saleor-domain header");
    throw new ProtectedHandlerError("Missing saleor-domain header", "MISSING_DOMAIN_HEADER");
  }

  if (!token) {
    debug("Missing authorization-bearer header");
    throw new ProtectedHandlerError(
      "Missing authorization-bearer header",
      "MISSING_AUTHORIZATION_BEARER_HEADER"
    );
  }

  // Check if domain has been registered in the APL
  const authData = await apl.get(domain);
  if (!authData) {
    debug("APL didn't found auth data for domain %s", domain);
    throw new ProtectedHandlerError(
      `Can't find auth data for domain ${domain}. Please register the application`,
      "NOT_REGISTERED"
    );
  }

  const appId = await getAppId(authData);
  if (!appId) {
    debug("Could not get the app ID.");
    throw new ProtectedHandlerError(
      `Could not get the app ID from the domain ${domain}`,
      "NO_APP_ID"
    );
  }

  try {
    await verifyJWT({ appId, token, domain });
  } catch (e) {
    throw new ProtectedHandlerError("JWT verification failed: ", "JWT_VERIFICATION_FAILED");
  }

  return {
    baseUrl,
    authData,
  };
};
