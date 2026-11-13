import axios from 'axios';
import { signalerRequete } from '../utils/reseau';
import { configuration } from '../config/runtime';

// Nom de variable aligne sur .env.example / README (VITE_API_BASE_URL) —
// le code lisait auparavant VITE_API_URL, qui n'existe nulle part ailleurs :
// un .env renseigne comme documente n'avait donc jamais d'effet.
// Docker : API_BASE_URL dans /config.js (voir config/runtime.js).
export const BASE_URL = configuration('API_BASE_URL', import.meta.env.VITE_API_BASE_URL, 'http://localhost:3101');

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Duree de chaque appel transmise a la surveillance reseau (utils/reseau.js).
client.interceptors.request.use((config) => {
  config.debutRequete = performance.now();
  return config;
});

const dureeDepuis = (config) => (config?.debutRequete ? performance.now() - config.debutRequete : 0);

client.interceptors.response.use(
  (response) => {
    signalerRequete({ ok: true, duree: dureeDepuis(response.config) });
    return response;
  },
  (error) => {
    // Pas de reponse = probleme de reseau (une erreur HTTP prouve au
    // contraire que le serveur est joignable).
    signalerRequete({ ok: Boolean(error.response), duree: dureeDepuis(error.config) });
    // Le contrat backend documente ici (README) et dans Backend_RestoApp
    // renvoie { code, message, field } sur une erreur. On les conserve tous
    // les trois sur l'Error rejetee (auparavant seul `message` etait garde,
    // `code`/`field` etaient perdus — impossible de cibler un champ precis
    // dans un formulaire, ou de distinguer les erreurs par code).
    const data = error.response?.data;
    // Pas de reponse du tout (reseau coupe, serveur arrete, timeout) : message
    // lisible plutot que "Network Error" / "timeout of 10000ms exceeded".
    const message = error.response
      ? data?.message || `Erreur du serveur (${error.response.status})`
      : 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
    const erreur = new Error(message);
    erreur.code = data?.code;
    erreur.field = data?.field;
    erreur.status = error.response?.status;
    return Promise.reject(erreur);
  }
);

export default client;