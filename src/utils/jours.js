// Jours de la semaine — memes identifiants que les plats du jour cote
// Manager_RestoApp (platsDuJourData.js, JOURS_SEMAINE).
export const JOURS_SEMAINE = [
  { id: 'LUNDI', nom: 'Lundi' },
  { id: 'MARDI', nom: 'Mardi' },
  { id: 'MERCREDI', nom: 'Mercredi' },
  { id: 'JEUDI', nom: 'Jeudi' },
  { id: 'VENDREDI', nom: 'Vendredi' },
  { id: 'SAMEDI', nom: 'Samedi' },
  { id: 'DIMANCHE', nom: 'Dimanche' },
];

export function jourLabel(id) {
  return JOURS_SEMAINE.find((j) => j.id === id)?.nom || id;
}

// Date.getDay() : 0 = dimanche
export function jourCourant(date = new Date()) {
  return JOURS_SEMAINE[(date.getDay() + 6) % 7].id;
}
