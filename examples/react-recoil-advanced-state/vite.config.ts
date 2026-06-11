import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.PLAYGROUND_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
