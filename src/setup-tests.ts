import crypto from "node:crypto";

/**
 * Emulate browser/web crypto - in tests it doesn't exist.
 * In a runtime global crypto is defined
 */
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => crypto.randomUUID(),
  },
});
