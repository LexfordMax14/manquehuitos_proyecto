import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // /uploads sirve las fotos que suben los usuarios en los comentarios.
  server: {
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:3001',
      '/uploads': process.env.API_PROXY_TARGET || 'http://localhost:3001',
    },
  },
})
