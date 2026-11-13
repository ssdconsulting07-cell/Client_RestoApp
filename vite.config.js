import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Version de l'app (package.json), affichee en pied de page et sur l'ecran
// de demarrage.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  server: {
    port: 5173,
    // Relais du mock API (json-server, port 3101) sous /api-mock : avec
    // VITE_API_BASE_URL=/api-mock, l'app et ses donnees passent par le meme
    // port. Indispensable pour tester via un tunnel (VS Code port
    // forwarding, ngrok...) ou depuis un telephone du reseau local, ou
    // "localhost:3101" designerait l'appareil du testeur.
    proxy: {
      '/api-mock': {
        target: 'http://localhost:3101',
        changeOrigin: true,
        rewrite: (chemin) => chemin.replace(/^\/api-mock/, ''),
      },
    },
  },
})
