import client from './client';

export const getProduits = () => client.get('/produits').then((r) => r.data);
export const getProduit = (id) => client.get(`/produits/${id}`).then((r) => r.data);