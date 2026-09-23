import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Production is served from GitHub Pages at /increment/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/increment/' : '/',
  plugins: [react()],
  worker: { format: 'es' },
  test: { include: ['test/**/*.test.ts'] },
}));
