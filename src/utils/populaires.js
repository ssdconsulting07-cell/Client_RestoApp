// Ordre de popularite des produits (Accueil) : badge Tendance d'abord
// (automatique = les plus commandes, ou force par le Gerant), puis les plus
// commandes sur 30 jours (champ popularite du backend), produits en rupture
// a la fin.
export function populairesDabord(liste) {
  const rang = (p) => (p.disponibilite === 'RUPTURE' ? 2 : p.tendance ? 0 : 1);
  return [...liste].sort(
    (a, b) => rang(a) - rang(b) || Number(b.popularite || 0) - Number(a.popularite || 0)
  );
}
