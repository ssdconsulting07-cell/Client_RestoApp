import client from './client';

// Catalogue publie par le Gerant (Manager_RestoApp, espace Gerant) — memes
// ressources, memes champs que le back-office :
//   categories                  { id, nom, statut }
//   produits                    { id, nom, description, prix, categorieId, photoUrl, statut, disponibilite, tendance? }
//   plats-du-jour               { id, nom, description, prix, photoUrl, jour, statut }
//   accompagnements-condiments  { id, nom, prix, type, statut }
// Seules les fiches ACTIF sont visibles cote client (BROUILLON et ARCHIVE
// restent internes au back-office). Le filtre est applique ici ET cote
// serveur (?statut=ACTIF) pour que le client n'affiche jamais un brouillon,
// meme si l'API ignorait le parametre.
const actifs = (liste) => (Array.isArray(liste) ? liste.filter((i) => i.statut === 'ACTIF') : []);

export const getCategories = () =>
  client.get('/categories', { params: { statut: 'ACTIF' } }).then((r) => actifs(r.data));

export const getProduits = () =>
  client.get('/produits', { params: { statut: 'ACTIF' } }).then((r) => actifs(r.data));

export const getPlatsDuJour = () =>
  client.get('/plats-du-jour', { params: { statut: 'ACTIF' } }).then((r) => actifs(r.data));

export const getAccompagnementsCondiments = () =>
  client
    .get('/accompagnements-condiments', { params: { statut: 'ACTIF' } })
    .then((r) => actifs(r.data));
