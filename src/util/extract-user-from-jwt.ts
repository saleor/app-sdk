import * as jose from "jose";

import { AppPermission } from "../types";

type TokenUserPayload = {
  email: string;
  userPermissions: AppPermission[];
};

export const extractUserFromJwt = (jwtToken: string): TokenUserPayload => {
  const tokenDecoded = jose.decodeJwt(jwtToken);

  const { email, user_permissions: userPermissions } = tokenDecoded;

  return {
    email,
    userPermissions,
  } as TokenUserPayload;
};
