import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/const.ts",
    "src/types.ts",
    "src/urls.ts",
    "src/headers.ts",
    "src/saleor-app.ts",
    "src/infer-webhooks.ts",
    "src/APL/index.ts",
    "src/app-bridge/index.ts",
    "src/app-bridge/next/index.ts",
    "src/handlers/next/index.ts",
    "src/middleware/index.ts",
    "src/settings-manager/index.ts",
  ],
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  splitting: true,
  external: ["**/*.md"],
});
