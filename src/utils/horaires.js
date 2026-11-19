// Horaires d'ouverture du restaurant (marque.horaires, restaurant.json),
// mis en forme pour l'affichage. Ils sont seulement AFFICHES : les commandes
// restent possibles a toute heure (les plats du jour suivent les services,
// voir services.js).
import { JOURS_SEMAINE } from './jours';
import { heureLisible } from './services';

const ORDRE = JOURS_SEMAINE.map((j) => j.id);

/** ['lundi', 'mardi', 'mercredi', 'vendredi'] -> "Lundi au mercredi, vendredi". */
export function joursLisibles(jours) {
  const index = [...new Set((jours || []).map((j) => ORDRE.indexOf(String(j).toUpperCase())))]
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  const groupes = [];
  for (const i of index) {
    const dernier = groupes.at(-1);
    if (dernier && dernier.fin === i - 1) dernier.fin = i;
    else groupes.push({ debut: i, fin: i });
  }
  const nom = (i) => JOURS_SEMAINE[i].nom.toLowerCase();
  const texte = groupes
    .map((g) => (g.fin === g.debut ? nom(g.debut) : g.fin === g.debut + 1 ? `${nom(g.debut)}, ${nom(g.fin)}` : `${nom(g.debut)} au ${nom(g.fin)}`))
    .join(', ');
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** [{ jours, debut, fin }] -> ["Lundi au jeudi : 11 h 30 – 23 h", ...] ; liste vide si rien de valide. */
export function horairesLisibles(horaires) {
  if (!Array.isArray(horaires)) return [];
  return horaires
    .filter((h) => h && Array.isArray(h.jours) && h.jours.length && h.debut && h.fin)
    .map((h) => `${joursLisibles(h.jours)} : ${heureLisible(h.debut)} – ${heureLisible(h.fin)}`);
}
