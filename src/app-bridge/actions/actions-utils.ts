import { v4 as uuidv4 } from "uuid";

export type Action<Name extends string, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

export type ActionWithId<Name extends string, Payload extends {}> = {
  payload: Payload & { actionId: string };
  type: Name;
};

export function withActionId<
  Name extends string,
  Payload extends {},
  T extends Action<Name, Payload>
>(action: T): ActionWithId<Name, Payload> {
  const actionId = uuidv4();

  return {
    ...action,
    payload: {
      ...action.payload,
      actionId,
    },
  };
}
