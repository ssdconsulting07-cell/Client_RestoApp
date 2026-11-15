import { BASE_URL } from './client';

// Temps reel de l'App Client : le backend signale qu'une donnee publique a
// change (evenement "changement" { sujet }) et l'app recharge seulement ce
// sujet : catalogue (produits, ruptures, categories, accompagnements),
// plats-du-jour, annonces, horaires, zones. Une seule connexion SSE partagee
// par toute l'app ; elle se reconnecte seule (EventSource) et, au retour en
// ligne ou sur l'onglet, tous les sujets sont recharges (rattrapage).
const abonnes = new Map(); // sujet -> Set(callback)
let source = null;

const SUJETS = ['catalogue', 'plats-du-jour', 'annonces', 'horaires', 'zones'];

function prevenir(sujet) {
  (abonnes.get(sujet) || []).forEach((cb) => {
    try {
      cb();
    } catch {
      // un abonne en erreur n'empeche pas les autres
    }
  });
}

const toutRecharger = () => SUJETS.forEach(prevenir);

function demarrer() {
  if (source || typeof window === 'undefined' || typeof window.EventSource === 'undefined') return;
  // Le mock de demonstration (json-server) n'a pas de flux temps reel.
  if (/api-mock|:3101/.test(BASE_URL)) return;
  let deconnecte = false;
  source = new window.EventSource(`${BASE_URL.replace(/\/$/, '')}/temps-reel/public`);
  source.addEventListener('changement', (e) => {
    try {
      const { sujet } = JSON.parse(e.data);
      if (sujet) prevenir(sujet);
    } catch {
      // message illisible : ignore
    }
  });
  source.onerror = () => {
    deconnecte = true;
  };
  source.onopen = () => {
    // Reconnexion apres une coupure : des changements ont pu etre manques.
    if (deconnecte) toutRecharger();
    deconnecte = false;
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') toutRecharger();
  });
}

/** S'abonne aux changements d'un sujet ; renvoie la fonction de desabonnement. */
export function ecouterChangements(sujet, callback) {
  demarrer();
  if (!abonnes.has(sujet)) abonnes.set(sujet, new Set());
  abonnes.get(sujet).add(callback);
  return () => abonnes.get(sujet)?.delete(callback);
}
