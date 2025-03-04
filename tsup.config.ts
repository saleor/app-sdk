import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    types: "src/types.ts",
    headers: "src/headers.ts",
    util: "src/util/public/index.ts",
    "util/browser": "src/util/public/browser/index.ts",
    "saleor-app": "src/saleor-app.ts",
    /**
     * APLs
     */
    "APL/index": "src/APL/index.ts",
    "APL/redis/index": "src/APL/redis/index.ts",
    "APL/upstash/index": "src/APL/upstash/index.ts",
    "APL/vercel-kv/index": "src/APL/vercel-kv/index.ts",
    "APL/env/index": "src/APL/env/index.ts",
    "APL/file/index": "src/APL/file/index.ts",
    "APL/saleor-cloud/index": "src/APL/saleor-cloud/index.ts",

    "app-bridge/index": "src/app-bridge/index.ts",
    "app-bridge/next/index": "src/app-bridge/next/index.ts",
    "settings-manager/index": "src/settings-manager/index.ts",
    "handlers/shared/index": "src/handlers/shared/index.ts",

    // Mapped exports
    "handlers/next/index": "src/handlers/platforms/next/index.ts",
    "handlers/fetch-api/index": "src/handlers/platforms/fetch-api/index.ts",
    "handlers/aws-lambda/index": "src/handlers/platforms/aws-lambda/index.ts",
    "handlers/next-app-router/index": "src/handlers/platforms/next-app-router/index.ts",
    "auth/node/index": "src/auth/node/index.ts",
    "auth/browser/index": "src/auth/browser/index.ts",
  },
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  splitting: true,
  external: ["**/*.md"],
});
