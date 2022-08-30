# Debugging

The ability to debug is important for app developers.
App SDK provides opt-in verbose logs, that can be enabled for specific modules.

Debug logs are implemented with [debug](https://www.npmjs.com/package/debug) package and work both in Node and Browser

## Enabling verbose logs

Debug logs are aggregated within [namespaces](#namespaces). They can be all enabled, disabled, or confugred.

By default, all verbose logs are disabled

To enable logs, use following:

### Enabling in Node context

Add `DEBUG={namespaces}` env variable

#### Example

```shell
DEBUG=* pnpm run dev
```

For more details check [debug package](https://github.com/debug-js/debug#usage).

### Enabling in Browser context

Set `localStorage.debug = '{namepsaces}'` in your frontend code. For more details see [debug package](https://github.com/debug-js/debug#browser-support).

#### Example

```javascript
// In devtools console
localStorage.debug = "*";
```

## Namespaces

Use the namespace name to enable debug logs for each module.

| Namespace name | Description                                        |
| -------------- | -------------------------------------------------- |
| \*             | Enable all                                         |
| AppBridge      | Enable [AppBridge](./app-bridge.md) (browser only) |
