const CONFIG = {
  'en-attente':     { label: 'En attente',     classes: 'bg-amber-100 text-amber-700' },
  'en-preparation': { label: 'En préparation', classes: 'bg-blue-100 text-blue-700' },
  'prete':          { label: 'Prête',          classes: 'bg-indigo-100 text-indigo-700' },
  'livree':         { label: 'Livrée',         classes: 'bg-emerald-100 text-emerald-700' },
  'validee':        { label: 'Validée',        classes: 'bg-gray-100 text-gray-700' },
  'annulee':        { label: 'Annulée',        classes: 'bg-red-100 text-red-700' },
};

export default function BadgeStatut({ statut }) {
  const c = CONFIG[statut] || CONFIG['en-attente'];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${c.classes}`}
    >
      {c.label}
    </span>
  );
}