// Formate une date ISO en "12 oct. 2025 à 14h30"
export function formatDateHeure(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const heure = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} à ${heure.replace(':', 'h')}`;
}

// Retourne "il y a 2h", "hier", "il y a 3 jours"...
export function tempsRelatif(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const h = Math.floor(min / 60);
  const j = Math.floor(h / 24);

  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (h < 24) return `il y a ${h}h`;
  if (j === 1) return 'hier';
  if (j < 7) return `il y a ${j} jours`;
  if (j < 30) return `il y a ${Math.floor(j / 7)} sem.`;
  return `il y a ${Math.floor(j / 30)} mois`;
}

// Nombre de jours écoulés depuis une date
export function joursDepuis(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}