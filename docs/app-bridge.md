# AppBridge

App bridge is an interface that connects App (running inside Dashboard) with Dashboard itself.

## Setup

Create instance of AppBridge by running following code

```js
import { AppBridge } from "@saleor/app-sdk/app-bridge";

const appBridge = new AppBridge(options);
```

## Access app state:

```js
const { token, domain, ready, id } = appBridge.getState();
```

Available state represents `AppBridgeState`:

```typescript
type AppBridgeState = {
  token?: string;
  id: string;
  ready: boolean;
  domain: string;
  path: string;
  theme: ThemeType;
};
```

## Events

Events are messages that originate in Saleor Dashboard. AppBridge can subscribe on events and app can react on them

### Subscribing to events

`subscribe(eventType, callback)` - can be used to listen to particular [event type](#available-event-types). It returns an unsubscribe function, which unregisters the callback.

Example:

```typescript
const unsubscribe = appBridge.subscribe("handshake", (payload) => {
  setToken(payload.token); // do something with event payload

  const { token } = appState.getState(); // you can also get app's current state here
});

// unsubscribe when callback is no longer needed
unsubscribe();
```

### Unsubscribing multiple listeners

`unsubscribeAll(eventType?)` - unregisters all callbacks of provided type. If no type was provided, it will remove all event callbacks.

Example:

```js
// unsubscribe from all handshake events
appBridge.unsubscribeAll("handshake");

// unsubscribe from all events
appBridge.unsubscribeAll();
```

### Available event types

| Event type  | Description                                                                  |
| :---------- | :--------------------------------------------------------------------------- |
| `handshake` | Fired when iFrame containing the App is initialized or new token is assigned |
| `response`  | Fired when Dashboard responds to an Action                                   |
| `redirect`  | Fired when Dashboard changes a subpath within the app path                   |
| `theme`     | Fired when Dashboard changes the theme                                       |

## Actions

Actions expose a high-level API to communicate with Saleor Dashboard. They're exported under an `actions` namespace.

### Available methods

**`dispatch(action)`** - dispatches an Action. Returns a promise which resolves when action is successfully completed.

Example:

```js
import { actions } from "@saleor/app-sdk/app-bridge";

const handleRedirect = async () => {
  await appBridge.dispatch(actions.Redirect({ to: "/orders" }));

  console.log("Redirect complete!");
};

handleRedirect();
```

### Available actions

| Action         | Arguments                                                        | Description |
| :------------- | :--------------------------------------------------------------- | :---------- |
| `Redirect`     | `to` (string) - relative (inside Dashboard) or absolute URL path |             |
|                | `newContext` (boolean) - should open in a new browsing context   |             |
| `Notification` | `status` (`info` / `success` / `warning` / `error` / undefined)  |             |
|                | `title` (string / undefined) - title of the notification         |             |
|                | `text` (string / undefined) - content of the notification        |             |
|                | `apiMessage` (string / undefined) - error log from api           |             |