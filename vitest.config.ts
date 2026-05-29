import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Mirror the "@/*" path alias from tsconfig so tests import the same way the
  // app does. Scoped to "@/..." so it never shadows "@scope" npm packages.
  resolve: {
    alias: [{ find: /^@\/(.*)$/, replacement: `${resolve(root)}/$1` }],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
