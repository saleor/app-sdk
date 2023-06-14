import { AuthData } from "../../APL";
import { TokenUserPayload } from "../../util/extract-user-from-jwt";

export type ProtectedHandlerContext = {
  baseUrl: string;
  authData: AuthData;
  user: TokenUserPayload;
};
