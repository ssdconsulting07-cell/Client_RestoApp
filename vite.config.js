import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Version de l'app, affichee en pied de page et sur l'ecran de demarrage :
// APP_VERSION fournie a la construction (tag Git, voir Dockerfile et CI),
// sinon celle de package.json. Jamais a retaper dans le code.
const versionPaquet = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version
const version = (process.env.APP_VERSION || '').trim().replace(/^v/, '') || versionPaquet

// Relais vers l'API, sur le meme port que l'app : indispensable pour tester
// via un tunnel (VS Code port forwarding, ngrok...) ou depuis un telephone du
// reseau local, ou "localhost:8080" designerait l'appareil du testeur.
// - /api      -> vrai backend (VITE_API_BASE_URL=/api/v1). L'en-tete Origin
//   est retire : pour le navigateur la requete est "meme origine", et sans ca
//   le backend refuserait l'adresse du tunnel (CORS) ; l'App Client ne
//   s'authentifie pas par cookie.
// - /api-mock -> mock json-server de demonstration (VITE_API_BASE_URL=/api-mock).
const relais = {
  '/api-mock': {
    target: process.env.MOCK_UPSTREAM || 'http://localhost:3101',
    changeOrigin: true,
    rewrite: (chemin) => chemin.replace(/^\/api-mock/, ''),
  },
  '/api': {
    target: process.env.API_UPSTREAM || 'http://localhost:8080',
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (requete) => requete.removeHeader('origin'))
    },
  },
}

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  server: { port: 5173, proxy: relais },
  // vite preview (build servi tel quel, rapide a travers un tunnel) : meme relais.
  preview: { port: 5173, proxy: relais },
})
