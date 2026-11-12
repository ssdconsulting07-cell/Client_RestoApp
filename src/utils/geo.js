// Distance a vol d'oiseau entre deux points GPS (formule de haversine), en km.
export function distanceKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// Rayon maximal autour du centre d'une zone pour la considerer comme "la
// zone du client" : au-dela, la position est jugee hors des zones livrees.
export const RAYON_ZONE_KM = 8;

// Zone de livraison deduite d'une position GPS : la plus proche parmi celles
// qui ont un centre (arrondissements officiels, voir senegalZones.js cote
// Manager), dans la limite de RAYON_ZONE_KM. Null si aucune ne convient.
export function zoneDepuisPosition(secteurs, position) {
  let meilleure = null;
  for (const s of secteurs) {
    if (!s.centre) continue;
    const d = distanceKm(position, s.centre);
    if (d <= RAYON_ZONE_KM && (!meilleure || d < meilleure.distance)) {
      meilleure = { secteur: s, distance: d };
    }
  }
  return meilleure?.secteur || null;
}
