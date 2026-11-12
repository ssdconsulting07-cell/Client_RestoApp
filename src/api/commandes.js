import client from './client';

// Commande au format partage avec Manager_RestoApp (Cuisine / Livreur /
// Vendeur, voir cuisineUtils.js et transitions.js cote Manager) :
// canal APP, mode LIVRAISON|RETRAIT, statut PAYEE a la creation (paiement
// en ligne avant creation), lignes[] avec prix fige, coordonnees client.
export const creerCommande = (commande) =>
  client.post('/commandes', commande).then((r) => r.data);

// Historique sans compte : le telephone sert de cle de retrouvaille.
export const getCommandesParTelephone = (telephone) =>
  client
    .get('/commandes', { params: { clientTelephone: telephone } })
    .then((r) =>
      (Array.isArray(r.data) ? r.data : [])
        .filter((c) => c.clientTelephone === telephone)
        .sort((a, b) => new Date(b.creeLe || 0) - new Date(a.creeLe || 0))
    );
