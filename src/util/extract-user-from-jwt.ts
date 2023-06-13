import * as jose from "jose";

import { Permission } from "../types";

export type TokenUserPayload = {
  email: string;
  userPermissions: Permission[];
};

export const extractUserFromJwt = (jwtToken: string): TokenUserPayload => {
  const tokenDecoded = jose.decodeJwt(jwtToken);

  const { email, user_permissions: userPermissions } = tokenDecoded;

  return {
    email,
    userPermissions,
  } as TokenUserPayload;
};
