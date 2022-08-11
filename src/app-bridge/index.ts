import { Actions } from "./actions";
import { app } from "./app";
import { EventType, ThemeType } from "./events";

export function createApp(targetDomain?: string) {
  let domain: string;
  const url = new URL(window.location.href);
  const id = url.searchParams.get("id") || "";
  const path = window.location.pathname || "";
  const theme: ThemeType = url.searchParams.get("theme") === "light" ? "light" : "dark";

  if (targetDomain) {
    domain = targetDomain;
  } else {
    domain = url.searchParams.get("domain") || "";
  }

  app.setState({ domain, id, path, theme });

  /**
   * Dispatches Action to Saleor Dashboard.
   *
   * @param action - Action containing type and payload.
   * @returns Promise resolved when Action is successfully completed.
   */
  async function dispatch<T extends Actions>(action: T) {
    return new Promise<void>((resolve, reject) => {
      if (window.parent) {
        window.parent.postMessage(
          {
            type: action.type,
            payload: action.payload,
          },
          "*"
        );

        let intervalId: NodeJS.Timer;

        const unsubscribe = app.subscribe(EventType.response, ({ actionId, ok }) => {
          if (action.payload.actionId === actionId) {
            unsubscribe();
            clearInterval(intervalId);

            if (ok) {
              resolve();
            } else {
              reject(
                new Error(
                  "Error: Action responded with negative status. This indicates the action method was not used properly."
                )
              );
            }
          }
        });

        // If dashboard doesn't respond within 1 second, reject and unsubscribe
        intervalId = setInterval(() => {
          unsubscribe();
          reject(new Error("Error: Action response timed out."));
        }, 1000);
      } else {
        reject(new Error("Error: Parent window does not exist."));
      }
    });
  }

  return {
    dispatch,
    subscribe: app.subscribe,
    unsubscribeAll: app.unsubscribeAll,
    getState: app.getState,
  };
}

export * from "./actions";
export * from "./events";
export * from "./types";
export default createApp;
