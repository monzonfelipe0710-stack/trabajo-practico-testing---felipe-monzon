import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['demo_practica/**', 'node_modules/**'],
  },
});
