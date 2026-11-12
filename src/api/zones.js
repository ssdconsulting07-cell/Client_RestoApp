import client from './client';

// Zones de livraison definies par le Gerant (Manager_RestoApp, page Zones de
// livraison) : Region (activable) -> Secteurs (arrondissements officiels ou
// zones ajoutees, chacun avec son prix de livraison). Seules les regions
// actives et les secteurs non masques sont proposes au client.
export const getRegionsActives = () =>
  client.get('/regions', { params: { active: true } }).then((r) =>
    (Array.isArray(r.data) ? r.data : []).filter((region) => region.active === true)
  );

export const getSecteurs = (regionId) =>
  client.get(`/regions/${encodeURIComponent(regionId)}/secteurs`).then((r) =>
    (Array.isArray(r.data) ? r.data : []).filter((s) => !s.estMasque)
  );
