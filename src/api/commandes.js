import client from './client';

export const creerCommande = (commande) =>
  client.post('/commandes', commande).then((r) => r.data);

export const getCommandesParTelephone = (telephone) =>
  client.get(`/commandes?telephone=${telephone}`).then((r) => r.data);