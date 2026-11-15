import client from './client';

// Annonces publiees par le Gerant (Manager_RestoApp, page Annonces) : des
// "chaines" de nouveautes, chacune de une ou plusieurs slides { titre,
// message, imageUrl }. Toutes les chaines ACTIF sont presentees a la suite,
// la DERNIERE publiee en premier (dernier entre, premier montre).
export const getAnnoncesActives = () =>
  client.get('/annonces', { params: { statut: 'ACTIF' } }).then((r) =>
    (Array.isArray(r.data) ? r.data : [])
      .filter((c) => c.statut === 'ACTIF' && Array.isArray(c.slides) && c.slides.length > 0)
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
  );
