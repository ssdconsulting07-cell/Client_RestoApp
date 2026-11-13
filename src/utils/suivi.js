// Jetons de suivi des commandes passees sur CET appareil.
//
// Le backend renvoie un jeton secret UNE SEULE FOIS, a la creation de la
// commande. Il donne acces au detail complet de la commande (GET
// /commandes/{id} avec l'en-tete X-Jeton-Suivi) et a la relance du paiement.
// Sans lui (autre appareil), seule la vue reduite par numero de telephone est
// disponible. Les identifiants de commande etant sequentiels, c'est ce jeton
// qui empeche de consulter la commande de quelqu'un d'autre.
//
// Stockage local, limite aux commandes recentes ; efface par "Oublier mon
// numero" (OrderContext.oublier).
const CLE = 'senyummies_jetons_suivi';
const MAX = 30;

function lire() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE));
    return Array.isArray(brut) ? brut.filter((e) => e && e.id && e.jeton) : [];
  } catch {
    return [];
  }
}

function ecrire(liste) {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste.slice(0, MAX)));
  } catch {
    // Stockage indisponible (navigation privee) : le suivi par telephone reste possible.
  }
}

export function memoriserJeton(id, jeton) {
  if (id == null || !jeton) return;
  const cle = String(id);
  ecrire([{ id: cle, jeton }, ...lire().filter((e) => e.id !== cle)]);
}

export function jetonDe(id) {
  if (id == null) return null;
  return lire().find((e) => e.id === String(id))?.jeton || null;
}

export function oublierJetons() {
  try {
    localStorage.removeItem(CLE);
  } catch {
    // rien a faire
  }
}
