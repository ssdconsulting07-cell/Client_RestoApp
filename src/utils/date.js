// Retourne "à l'instant", "il y a 5 min", "il y a 2 h", "hier"...
export function tempsRelatif(iso) {
  if (!iso) return '';
  const temps = new Date(iso).getTime();
  if (Number.isNaN(temps)) return '';
  const min = Math.max(0, Math.floor((Date.now() - temps) / 60000));
  const h = Math.floor(min / 60);
  const j = Math.floor(h / 24);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (h < 24) return `il y a ${h} h`;
  if (j === 1) return 'hier';
  if (j < 7) return `il y a ${j} jours`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
