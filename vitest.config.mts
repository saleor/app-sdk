import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    alias: {
      // "@": "/src",
    },
    setupFiles: ["./src/setup-tests.ts"],
    environment: "jsdom",
    css: false,
  },
});
