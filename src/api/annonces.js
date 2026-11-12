import client from './client';

// Annonces publiees par le Gerant (Manager_RestoApp, page Annonces) : des
// "chaines" de une ou plusieurs slides { titre, message, imageUrl }. Les
// chaines ACTIF sont presentees successivement, dans l'ordre de publication
// (voir AnnoncePopupPreview.jsx cote Manager, qui montre ce meme rendu).
export const getAnnoncesActives = () =>
  client.get('/annonces', { params: { statut: 'ACTIF' } }).then((r) =>
    (Array.isArray(r.data) ? r.data : [])
      .filter((c) => c.statut === 'ACTIF' && Array.isArray(c.slides) && c.slides.length > 0)
      .sort((a, b) => new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0))
  );
