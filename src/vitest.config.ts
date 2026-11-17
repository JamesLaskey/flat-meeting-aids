import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./immutable/vitest.setup.ts'],
  },
})