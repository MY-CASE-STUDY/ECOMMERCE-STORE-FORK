import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["node_modules", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.spec.ts", "**/node_modules/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
