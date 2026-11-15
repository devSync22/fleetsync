import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // In development the API is called through this proxy (VITE_API_BASE_URL = "/api"),
      // so the browser sees one origin and the HttpOnly refresh cookie (path /api/auth)
      // is sent like in production. Override the target with API_PROXY_TARGET.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:5215',
          changeOrigin: true,
        },
      },
    },
  }
})
