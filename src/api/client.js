import axios from 'axios';

// Nom de variable aligne sur .env.example / README (VITE_API_BASE_URL) —
// le code lisait auparavant VITE_API_URL, qui n'existe nulle part ailleurs :
// un .env renseigne comme documente n'avait donc jamais d'effet.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Le contrat backend documente ici (README) et dans Backend_RestoApp
    // renvoie { code, message, field } sur une erreur. On les conserve tous
    // les trois sur l'Error rejetee (auparavant seul `message` etait garde,
    // `code`/`field` etaient perdus — impossible de cibler un champ precis
    // dans un formulaire, ou de distinguer les erreurs par code).
    const data = error.response?.data;
    const message = data?.message || error.message || 'Une erreur est survenue';
    const erreur = new Error(message);
    erreur.code = data?.code;
    erreur.field = data?.field;
    erreur.status = error.response?.status;
    return Promise.reject(erreur);
  }
);

export default client;