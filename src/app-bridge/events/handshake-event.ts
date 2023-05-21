import { Version } from "./events";
import { DashboardEvent } from "./events-utils";

export const HANDSHAKE_EVENT_TYPE = "handshake";

export type HandshakeEvent = DashboardEvent<
  typeof HANDSHAKE_EVENT_TYPE,
  {
    token: string;
    version: Version;
  }
>;

export function createHandshakeEvent(token: string, version: Version = 1): HandshakeEvent {
  return {
    type: HANDSHAKE_EVENT_TYPE,
    payload: {
      token,
      version,
    },
  };
}
