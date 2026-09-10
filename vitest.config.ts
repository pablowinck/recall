import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests import web modules directly, so the app's own "@/" alias has to resolve here too.
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
  resolve: { alias: { '@': fileURLToPath(new URL('./apps/web/src', import.meta.url)) } },
});
