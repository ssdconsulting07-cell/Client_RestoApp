import { UtensilsCrossed } from 'lucide-react';

export default function Menu() {
  return (
    <div className="max-w-app mx-auto px-4 pt-6">
      <h1 className="text-2xl font-semibold mb-2">Menu</h1>
      <p className="text-sm text-ink-light mb-5">
        Ici s'affichera la liste des produits par catégories.
      </p>

      <div className="bg-surface p-10 rounded-md shadow-card flex flex-col items-center gap-3 text-ink-light">
        <UtensilsCrossed size={40} strokeWidth={1.5} />
        <span className="text-sm">Produits à venir…</span>
      </div>
    </div>
  );
}