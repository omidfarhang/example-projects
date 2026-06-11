import { defineConfig } from 'vite';

const base = process.env.PLAYGROUND_BASE ?? '/';

export default defineConfig({
  base,
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
  },
});
