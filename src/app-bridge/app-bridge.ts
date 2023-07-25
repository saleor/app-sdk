import debugPkg from "debug";

import { LocaleCode } from "../locales";
import { extractAppPermissionsFromJwt } from "../util/extract-app-permissions-from-jwt";
import { extractUserFromJwt } from "../util/extract-user-from-jwt";
import { Actions, actions } from "./actions";
import { AppBridgeState, AppBridgeStateContainer } from "./app-bridge-state";
import { AppIframeParams } from "./app-iframe-params";
import { SSR } from "./constants";
import { Events, EventType, PayloadOfEvent, ThemeType } from "./events";

const DISPATCH_RESPONSE_TIMEOUT = 1000;

type EventCallback<TPayload extends {} = {}> = (data: TPayload) => void;
type SubscribeMap = {
  [type in EventType]: Record<symbol, EventCallback<PayloadOfEvent<type>>>;
};

const debug = debugPkg.debug("app-sdk:AppBridge");

function eventStateReducer(state: AppBridgeState, event: Events) {
  switch (event.type) {
    case EventType.handshake: {
      const userJwtPayload = extractUserFromJwt(event.payload.token);
      const appPermissions = extractAppPermissionsFromJwt(event.payload.token);

      return {
        ...state,
        ready: true,
        token: event.payload.token,
        saleorVersion: event.payload.saleorVersion,
        dashboardVersion: event.payload.dashboardVersion,
        user: {
          email: userJwtPayload.email,
          permissions: userJwtPayload.userPermissions,
        },
        appPermissions,
      };
    }
    case EventType.redirect: {
      return {
        ...state,
        path: event.payload.path,
      };
    }
    case EventType.theme: {
      return {
        ...state,
        theme: event.payload.theme,
      };
    }
    case EventType.localeChanged: {
      return {
        ...state,
        locale: event.payload.locale,
      };
    }
    case EventType.tokenRefresh: {
      return {
        ...state,
        token: event.payload.token,
      };
    }
    case EventType.response: {
      return state;
    }
    default: {
      /**
       * Event comes from API, so always assume it can be something not covered by TS
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.warn(`Invalid event received: ${(event as any)?.type}`);
      return state;
    }
  }
}

const createEmptySubscribeMap = (): SubscribeMap => ({
  handshake: {},
  response: {},
  redirect: {},
  theme: {},
  localeChanged: {},
  tokenRefresh: {},
});

export type AppBridgeOptions = {
  targetDomain?: string;
  saleorApiUrl?: string;
  initialLocale?: LocaleCode;
  /**
   * Should automatically emit Actions.NotifyReady.
   * If app loading time is longer, this can be disabled and sent manually.
   */
  autoNotifyReady?: boolean;
  initialTheme?: ThemeType;
};

/**
 * TODO: Consider validating locale if wrong code provided
 */
const getLocaleFromUrl = () =>
  (new URL(window.location.href).searchParams.get(AppIframeParams.LOCALE) as LocaleCode) ||
  undefined;

/**
 * TODO: Probably remove empty string fallback
 */
const getDomainFromUrl = () =>
  new URL(window.location.href).searchParams.get(AppIframeParams.DOMAIN) || "";

const getSaleorApiUrlFromUrl = () =>
  new URL(window.location.href).searchParams.get(AppIframeParams.SALEOR_API_URL) || "";

const getThemeFromUrl = () => {
  const value = new URL(window.location.href).searchParams.get(AppIframeParams.THEME);

  switch (value) {
    case "dark":
    case "light":
      return value;
    default:
      return undefined;
  }
};

const getDefaultOptions = (): AppBridgeOptions => ({
  targetDomain: getDomainFromUrl(),
  saleorApiUrl: getSaleorApiUrlFromUrl(),
  initialLocale: getLocaleFromUrl() ?? "en",
  autoNotifyReady: true,
  initialTheme: getThemeFromUrl() ?? undefined,
});

export class AppBridge {
  private state: AppBridgeStateContainer;

  private refererOrigin = document.referrer ? new URL(document.referrer).origin : undefined;

  private subscribeMap = createEmptySubscribeMap();

  private combinedOptions = getDefaultOptions();

  constructor(options: AppBridgeOptions = {}) {
    debug("Constructor called with options: %j", options);

    if (SSR) {
      throw new Error(
        "AppBridge detected you're running this app in SSR mode. Make sure to call `new AppBridge()` when window object exists."
      );
    }

    this.combinedOptions = {
      ...this.combinedOptions,
      ...options,
    };

    this.state = new AppBridgeStateContainer({
      initialLocale: this.combinedOptions.initialLocale,
    });

    debug("Resolved combined AppBridge options: %j", this.combinedOptions);

    if (!this.refererOrigin) {
      // TODO probably throw
      console.warn("document.referrer is empty");
    }

    if (!this.combinedOptions.saleorApiUrl) {
      debug("?saleorApiUrl was not found in iframe url");
    }

    if (!this.combinedOptions.targetDomain) {
      debug("?domain was not found in iframe url");
    }

    if (!(this.combinedOptions.saleorApiUrl || this.combinedOptions.targetDomain)) {
      console.error(
        "domain and saleorApiUrl params were not found in iframe url. Ensure at least one of them is present"
      );
    }

    this.setInitialState();
    this.listenOnMessages();

    if (this.combinedOptions.autoNotifyReady) {
      this.sendNotifyReadyAction();
    }
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
    debug("subscribe() called with event %s and callback %s", eventType, cb.name);

    const key = Symbol("Callback token");
    // @ts-ignore fixme
    this.subscribeMap[eventType][key] = cb;

    return () => {
      debug("unsubscribe called with event %s and callback %s", eventType, cb.name);

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
      debug("unsubscribeAll called with event: %s", eventType);

      this.subscribeMap[eventType] = {};
    } else {
      debug("unsubscribeAll called without argument");

      this.subscribeMap = createEmptySubscribeMap();
    }
  }

  /**
   * Dispatch event to dashboard
   */
  async dispatch<T extends Actions>(action: T) {
    debug("dispatch called with action argument: %j", action);

    return new Promise<void>((resolve, reject) => {
      if (!window.parent) {
        debug("window.parent doesn't exist, will throw");

        reject(new Error("Parent window does not exist."));
        return;
      }

      debug("Calling window.parent.postMessage with %j", action);

      window.parent.postMessage(
        {
          type: action.type,
          payload: action.payload,
        },
        "*"
      );

      let timeoutId: number;

      const unsubscribe = this.subscribe(EventType.response, ({ actionId, ok }) => {
        debug(
          "Subscribing to %s with action id: %s and status 'ok' is: %s",
          EventType.response,
          actionId,
          ok
        );

        if (action.payload.actionId === actionId) {
          debug("Received matching action id: %s. Will unsubscribe", actionId);
          unsubscribe();
          clearTimeout(timeoutId);

          if (ok) {
            resolve();
          } else {
            reject(
              new Error(
                "Action responded with negative status. This indicates the action method was not used properly."
              )
            );
          }
        }
      });

      timeoutId = window.setTimeout(() => {
        unsubscribe();
        reject(new Error("Action response timed out."));
      }, DISPATCH_RESPONSE_TIMEOUT);
    });
  }

  /**
   * Gets current state
   */
  getState() {
    debug("getState() called and will return %j", this.state.getState());

    return this.state.getState();
  }

  sendNotifyReadyAction() {
    this.dispatch(actions.NotifyReady()).catch((e) => {
      console.error("notifyReady action failed");
      console.error(e);
    });
  }

  private setInitialState() {
    debug("setInitialState() called");

    const url = new URL(window.location.href);
    const id = url.searchParams.get(AppIframeParams.APP_ID) || "";
    const path = window.location.pathname || "";

    const state: Partial<AppBridgeState> = {
      domain: this.combinedOptions.targetDomain,
      id,
      path,
      theme: this.combinedOptions.initialTheme,
      saleorApiUrl: this.combinedOptions.saleorApiUrl,
      locale: this.combinedOptions.initialLocale,
    };

    debug("setInitialState() will setState with %j", state);

    this.state.setState(state);
  }

  private listenOnMessages() {
    debug("listenOnMessages() called");

    window.addEventListener(
      "message",
      ({ origin, data }: Omit<MessageEvent, "data"> & { data: Events }) => {
        debug("Received message from origin: %s and data: %j", origin, data);

        if (origin !== this.refererOrigin) {
          debug("Origin from message doesn't match refererOrigin. Function will return now");
          // TODO what should happen here - be explicit
          return;
        }

        const newState = eventStateReducer(this.state.getState(), data);
        debug("Computed new state: %j. Will be set with setState", newState);
        this.state.setState(newState);

        /**
         * TODO Validate and warn/throw
         */
        const { type, payload } = data;

        if (EventType[type]) {
          Object.getOwnPropertySymbols(this.subscribeMap[type]).forEach((key) => {
            debug("Executing listener for event: %s and payload %j", type, payload);
            // @ts-ignore fixme
            this.subscribeMap[type][key](payload);
          });
        }
      }
    );
  }
}
