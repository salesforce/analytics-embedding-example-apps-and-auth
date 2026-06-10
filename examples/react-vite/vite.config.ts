// Import from vitest/config (not vite) so the `test` field below typechecks.
// Vitest's defineConfig extends Vite's and adds the test surface.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 8500, strictPort: true },
  preview: { port: 8500, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    css: false,
  },
});
