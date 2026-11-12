// Cycle de vie d'une commande — memes valeurs et memes libelles que
// Manager_RestoApp (src/auth/transitions.js, STATUT_LABELS) :
//   PAYEE -> EN_PREPARATION -> PRETE -> EN_LIVRAISON -> LIVREE   (mode LIVRAISON)
//   PAYEE -> EN_PREPARATION -> PRETE -> RETIREE                  (mode RETRAIT)
//   PAYEE -> ANNULEE (Cuisine, uniquement avant le debut de la preparation)
// CREEE existe dans le contrat (commande non encore payee) mais une commande
// passee depuis l'app est payee avant sa creation : elle arrive en PAYEE.
export const STATUT_LABELS = {
  CREEE: 'Créée',
  PAYEE: 'Reçue',
  EN_PREPARATION: 'En préparation',
  PRETE: 'Prête',
  EN_LIVRAISON: 'En livraison',
  LIVREE: 'Livrée',
  RETIREE: 'Retirée',
  ANNULEE: 'Annulée',
};

export const STATUTS_TERMINAUX = ['LIVREE', 'RETIREE', 'ANNULEE'];

export function etapesPourMode(mode) {
  return mode === 'RETRAIT'
    ? ['PAYEE', 'EN_PREPARATION', 'PRETE', 'RETIREE']
    : ['PAYEE', 'EN_PREPARATION', 'PRETE', 'EN_LIVRAISON', 'LIVREE'];
}

// Libelles courts du suivi par etapes (place limitee sur mobile).
export const ETAPE_LABELS_COURTS = {
  PAYEE: 'Reçue',
  EN_PREPARATION: 'Cuisine',
  PRETE: 'Prête',
  EN_LIVRAISON: 'En route',
  LIVREE: 'Livrée',
  RETIREE: 'Retirée',
};

export function normaliserStatut(statut) {
  const s = String(statut || '').toUpperCase();
  if (s === 'CREEE') return 'PAYEE';
  return STATUT_LABELS[s] ? s : 'PAYEE';
}

export function detailStatut(statut, mode) {
  switch (normaliserStatut(statut)) {
    case 'EN_PREPARATION':
      return 'Nos cuisiniers préparent votre commande.';
    case 'PRETE':
      return mode === 'RETRAIT'
        ? 'Votre commande vous attend au comptoir. Présentez votre numéro de ticket.'
        : 'Votre commande est prête et attend son livreur.';
    case 'EN_LIVRAISON':
      return 'Votre commande est en route. Présentez ce QR code au livreur à la remise.';
    case 'LIVREE':
      return 'Votre commande a été livrée. Merci de votre confiance !';
    case 'RETIREE':
      return 'Votre commande a été retirée. Merci de votre confiance !';
    case 'ANNULEE':
      return 'Cette commande a été annulée par le restaurant. Contactez-nous pour toute question.';
    default:
      return 'Le restaurant a bien reçu votre commande. Elle part bientôt en cuisine.';
  }
}

// Numero de ticket affiche et encode dans le QR — meme regle que
// ticketId() de Manager_RestoApp (cuisineUtils.js) : l'id sans prefixe demo-.
export function ticketId(commande) {
  return String(commande?.id ?? '').replace(/^demo-/, '');
}

// Contenu du QR code presente au livreur — format attendu par
// ScanLivraisonModal.jsx (Manager, espace Livreur) : "SENYUMMIES-<ticket>".
export function contenuQrLivraison(commande) {
  return `SENYUMMIES-${ticketId(commande)}`;
}
