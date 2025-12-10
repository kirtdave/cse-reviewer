import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        console.error('Build warning:', warning)
        warn(warning)
      }
    }
  },
  logLevel: 'info'
})