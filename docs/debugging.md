# Debugging

The ability to debug is important for app developers.
App SDK provides opt-in verbose logs, that can be enabled for specific modules.

Debug logs are implemented with [debug](https://www.npmjs.com/package/debug) package and work both in Node and Browser.

## Enabling verbose logs

Debug logs are aggregated within [namespaces](#namespaces). They can be enabled, disabled, or configured.

By default, all verbose logs are disabled.

To enable logs, use the following:

### Enabling in Node context

Add `DEBUG=app-sdk:{namespaces}` env variable.

#### Example

```shell
DEBUG=* pnpm run dev
```

For more details check [debug package](https://github.com/debug-js/debug#usage).

### Enabling in Browser context

Set `localStorage.debug = 'app-sdk:{namepsaces}'` in your frontend code. For more details see [debug package](https://github.com/debug-js/debug#browser-support).

#### Debug in iframe

Note, that Saleor Apps are usually hosted on a different domain than Saleor Dashboard.
That means `localStorage` must be called in the context of the App's URL, not Saleor Dashboard.

#### Example

```javascript
// In devtools console
localStorage.debug = "*";
```

## Namespaces

Use the namespace name to enable debug logs for each module.

| Namespace name                | Description                                        |
|-------------------------------|----------------------------------------------------|
| \app-sdk:\*                   | Enable all                                         |
| app-sdk:AppBridge             | Enable [AppBridge](./app-bridge.md) (browser only) |
| app-sdk:Middleware:\*         | Enable all middlewares (node only)                 |
| app-sdk:APL:\*                | Enable all APLs (node only)                        |
| app-sdk:SaleorAsyncWebhook:\* | Enable SaleorAsyncWebhook utility                  |
