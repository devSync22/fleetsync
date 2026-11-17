/// <reference types="vite/client" />

/** Environment variables the web app reads (see apps/web/.env.example). */
interface ImportMetaEnv {
  /** Base URL of the FleetSync API, e.g. "/api" (Vite dev proxy) or "https://api.fleetsync.lk/api". */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
