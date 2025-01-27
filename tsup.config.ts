import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    const: "src/const.ts",
    types: "src/types.ts",
    urls: "src/urls.ts",
    headers: "src/headers.ts",
    "saleor-app": "src/saleor-app.ts",
    "verify-jwt": "src/verify-jwt.ts",
    "verify-signature": "src/verify-signature.ts",
    "APL/index": "src/APL/index.ts",
    "APL/redis/index": "src/APL/redis/index.ts",
    "APL/vercel-kv/index": "src/APL/vercel-kv/index.ts",
    "app-bridge/index": "src/app-bridge/index.ts",
    "app-bridge/next/index": "src/app-bridge/next/index.ts",
    "fetch-middleware/index": "src/fetch-middleware/index.ts",
    "middleware/index": "src/middleware/index.ts",
    "settings-manager/index": "src/settings-manager/index.ts",

    // Mapped exports
    "handlers/next/index": "src/handlers/platforms/next/index.ts",
    "handlers/fetch-api/index": "src/handlers/platforms/fetch-api/index.ts",
    "handlers/aws-lambda/index": "src/handlers/platforms/fetch-api/index.ts",
    "handlers/shared/index": "src/handlers/shared/index.ts",
    "handlers/actions/index": "src/handlers/actions/index.ts",

    // Virtual export
    "handlers/next-app-router/index": "src/handlers/platforms/fetch-api/index.ts",
  },
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  splitting: true,
  external: ["**/*.md"],
});
