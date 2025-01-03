import { SaleorProtectedHandlerError } from "../next";

export const ProtectedHandlerErrorCodeMap: Record<SaleorProtectedHandlerError, number> = {
  OTHER: 500,
  MISSING_HOST_HEADER: 400,
  MISSING_DOMAIN_HEADER: 400,
  MISSING_API_URL_HEADER: 400,
  NOT_REGISTERED: 401,
  JWT_VERIFICATION_FAILED: 401,
  NO_APP_ID: 401,
  MISSING_AUTHORIZATION_BEARER_HEADER: 400,
};
