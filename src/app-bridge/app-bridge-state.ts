import { Events, EventType, PayloadOfEvent, ThemeType } from "./events";

export type AppBridgeState = {
  token?: string;
  id: string;
  ready: boolean;
  domain: string;
  path: string;
  theme: ThemeType;
};
type EventCallback<TPayload extends {} = {}> = (data: TPayload) => void;
type SubscribeMap = {
  [type in EventType]: Record<symbol, EventCallback<PayloadOfEvent<type>>>;
};

function reducer(state: AppBridgeState, event: Events) {
  switch (event.type) {
    case EventType.handshake: {
      const newState = {
        ...state,
        ready: true,
        token: event.payload.token,
      };

      return newState;
    }
    case EventType.redirect: {
      const newState = {
        ...state,
        path: event.payload.path,
      };

      return newState;
    }
    case EventType.theme: {
      const newState = {
        ...state,
        theme: event.payload.theme,
      };

      return newState;
    }
    default: {
      return state;
    }
  }
}

export class AppBridgeStateContainer {
  private state: AppBridgeState = {
    id: "",
    domain: "",
    ready: false,
    path: "/",
    theme: "light",
  };

  private subscribeMap: SubscribeMap = {
    handshake: {},
    response: {},
    redirect: {},
    theme: {},
  };

  private refererOrigin: string | null = null;

  constructor() {
    try {
      this.refererOrigin = new URL(document.referrer).origin;
    } catch (e) {
      // TODO probably throw
      console.warn("document.referrer is empty");
    }

    this.listenOnMessages();
  }

  /**
   * TODO Move to higher instance
   * @private
   */
  private listenOnMessages() {
    window.addEventListener(
      "message",
      ({ origin, data }: Omit<MessageEvent, "data"> & { data: Events }) => {
        // check if event origin matches the document referer
        if (origin !== this.refererOrigin) {
          // TODO what should happen here - be explicit
          return;
        }

        this.state = reducer(this.state, data);

        /**
         * TODO Validate and warn/throw
         */
        const { type, payload } = data;

        if (EventType[type]) {
          Object.getOwnPropertySymbols(this.subscribeMap[type]).forEach((key) =>
            // @ts-ignore fixme
            this.subscribeMap[type][key](payload)
          );
        }
      }
    );
  }

  /**
   * Subscribes to an Event.
   *
   * @param eventType - Event type.
   * @param cb - Callback that executes when Event is registered. Called with Event payload object.
   * @returns Unsubscribe function. Call to unregister the callback.
   */
  subscribe<TEventType extends EventType, TPayload extends PayloadOfEvent<TEventType>>(
    eventType: TEventType,
    cb: EventCallback<TPayload>
  ) {
    const key = Symbol("Callback token");
    // @ts-ignore fixme
    this.subscribeMap[eventType][key] = cb;

    return () => {
      delete this.subscribeMap[eventType][key];
    };
  }

  /**
   * Unsubscribe to all Events of type.
   * If type not provider, unsubscribe all
   *
   * @param eventType - (optional) Event type. If empty, all callbacks will be unsubscribed.
   */
  unsubscribeAll(eventType?: EventType) {
    if (eventType) {
      this.subscribeMap[eventType] = {};
    } else {
      this.subscribeMap = {
        handshake: {},
        response: {},
        redirect: {},
        theme: {},
      };
    }
  }

  getState() {
    return this.state;
  }

  setState(newState: Partial<AppBridgeState>) {
    this.state = {
      ...this.state,
      ...newState,
    };

    return this.state;
  }
}
