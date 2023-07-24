import * as jose from "jose";

import { AppPermission } from "../types";

export const extractAppPermissionsFromJwt = (jwtToken: string): AppPermission[] => {
  const tokenDecoded = jose.decodeJwt(jwtToken);

  return tokenDecoded.permissions as AppPermission[];
};
