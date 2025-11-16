/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RUTGERS_SKEY?: string
  readonly VITE_RUTGERS_PROXY?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_GEMINI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

