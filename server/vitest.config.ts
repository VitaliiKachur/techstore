import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["src/**/*.test.ts", "src/lib/prisma.ts"],
      include: ["src/lib/**/*.ts", "src/middleware/**/*.ts"],
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
