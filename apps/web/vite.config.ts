import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// Env vars live in the repo-root .env (see .env.example), shared with the rest of the monorepo.
const envDir = path.resolve(import.meta.dirname, '../..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    envDir,
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
