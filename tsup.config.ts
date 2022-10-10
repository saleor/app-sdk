import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    /**
     * TODO Introduce breaking change and remove exporting from paths, merge everything to index
     */
    "src/*",
    "src/index.ts",
    "src/APL/index.ts",
    "src/app-bridge/index.ts",
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
