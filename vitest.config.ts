import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment configuration
    environment: "jsdom",

    // Setup files
    setupFiles: ["./tests/setup/vitest.setup.ts"],

    // Globals (dla kompatybilności z testami używającymi describe/it bez importu)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "tests/", "**/*.d.ts", "**/*.config.*", "**/mockData", "dist/", ".astro/"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Test file patterns
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".astro", "tests/e2e"],

    // Watch configuration
    watch: false,

    // Test timeout
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@lib": resolve(__dirname, "./src/lib"),
      "@types": resolve(__dirname, "./src/types"),
    },
  },
});
