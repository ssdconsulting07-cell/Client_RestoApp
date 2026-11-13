import client from './client';

// Commande au format du contrat backend (Backend_RestoApp, contrat-api) :
// canal APP, mode LIVRAISON|RETRAIT, lignes[], coordonnees client.
// Le statut et le paiement sont decides par le SERVEUR (jamais envoyes) :
// la commande nait CREEE / en_attente, puis passe PAYEE a la confirmation
// du prestataire de paiement.
//
// cleIdempotence (en-tete Idempotency-Key) : la MEME cle est renvoyee si
// l'envoi est retente (coupure reseau) ; le serveur rejoue alors la premiere
// reponse au lieu de creer une deuxieme commande.
//
// Reponse : la commande + jetonSuivi (secret, renvoye une seule fois) +
// paiement { redirectUrl, simule }.
export const creerCommande = (commande, cleIdempotence) =>
  client
    .post('/commandes', commande, {
      headers: cleIdempotence ? { 'Idempotency-Key': cleIdempotence } : {},
    })
    .then((r) => r.data);

// Historique sans compte : le telephone sert de cle de retrouvaille (vue
// reduite cote serveur : statut, lignes, montants ; ni nom ni position).
export const getCommandesParTelephone = (telephone) =>
  client
    .get('/commandes', { params: { clientTelephone: telephone } })
    .then((r) =>
      (Array.isArray(r.data) ? r.data : [])
        .filter((c) => c.clientTelephone === telephone)
        .sort((a, b) => new Date(b.creeLe || 0) - new Date(a.creeLe || 0))
    );

// Detail complet d'une commande de CET appareil (jeton de suivi requis).
export const getCommande = (id, jeton) =>
  client.get(`/commandes/${encodeURIComponent(id)}`, { headers: { 'X-Jeton-Suivi': jeton } }).then((r) => r.data);

// Relance du paiement d'une commande en attente : { paymentReference, redirectUrl, ... }.
export const relancerPaiement = (commandeId, jeton) =>
  client.post('/paiements/init', { commandeId }, { headers: { 'X-Jeton-Suivi': jeton } }).then((r) => r.data);
