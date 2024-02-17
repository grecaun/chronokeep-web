/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CHRONOKEEP_ACCESS_TOKEN: string
    readonly VITE_CHRONOKEEP_API_URL: string
    readonly VITE_CHRONOKEEP_REMOTE_URL: string
    readonly VITE_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}