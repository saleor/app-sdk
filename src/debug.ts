import debugPkg from "debug";

const debugObservables = new Set<Function>();

export const registerDebugLogger = (loggerHook: (message: string) => void) => {
  debugObservables.add(loggerHook);

  return () => debugObservables.delete(loggerHook);
};

export const createDebug = (namespace: string) => {
  const debugInstance = debugPkg.debug(`app-sdk:${namespace}`);
  console.log(debugInstance)

  const originalDebugLog = debugInstance.log.bind(debugInstance);

  debugInstance.log = (args) => {
    const log = originalDebugLog(args);
    debugObservables.forEach((d) => d(log as string));
  };

  return debugInstance
};
