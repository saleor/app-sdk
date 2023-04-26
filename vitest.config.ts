import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["./src/setup-tests.ts"],
    environment: "jsdom",
    css: false,
    coverage: {
      provider: "c8",
      reporter: ["text-summary", "cobertura"],
    },
  },
});
