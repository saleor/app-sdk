export type DashboardEvent<Name extends string, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

// Compatibility. Remove in v1. Do not use very generic names like Event
export type Event<Name extends string, Payload extends {}> = DashboardEvent<Name, Payload>;
