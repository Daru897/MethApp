import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
      lines: 89,
      statements: 89,
      branches: 86,
      functions: 100
    }
  }
});
