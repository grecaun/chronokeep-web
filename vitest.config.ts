import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

const publicDir = fileURLToPath(new URL('./public', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Components import public assets like '/logo.png', which only the dev server understands.
    alias: [{ find: /^\/(logo\.png|img\/[^/]+\.svg)$/, replacement: `${publicDir}/$1` }],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Use fake endpoints so tests never talk to a real server.
    env: {
      VITE_CHRONOKEEP_ACCESS_TOKEN: 'test-access-token',
      VITE_CHRONOKEEP_API_URL: 'https://api.test/',
      VITE_CHRONOKEEP_REMOTE_URL: 'https://remote.test/',
      VITE_BASE_URL: 'http://localhost:5173/',
    },
  },
})
