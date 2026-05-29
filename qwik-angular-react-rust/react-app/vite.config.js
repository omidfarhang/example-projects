import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    emptyOutDir: true,
    outDir: '../qwik-micro-frontend/public/mfes/react',
    lib: {
      entry: 'src/index.jsx',
      name: 'ReactMicroFrontendBundle',
      formats: ['iife'],
      fileName: () => 'react-microfrontend.js',
    },
  },
});
