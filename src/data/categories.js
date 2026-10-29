// NOTE (audit du 24/10/2026) : ce fichier n'est actuellement importe par
// aucune page — Accueil.jsx et Menu.jsx definissent chacun leur propre
// liste de categories en dur. Garde/aligne ici pour servir de reference
// si une page vient un jour le consommer. Valeurs alignees sur db.json
// (categorie reelle des produits cote API) ; 'plats-du-jour' reste a part,
// ce n'est pas une categorie de Produits mais une fiche independante cote
// Manager (voir brainstorming-chez-ketchup.md).
export const categories = [
  { id: 'tout', label: 'Tout', icone: 'SlidersHorizontal' },
  { id: 'plats-du-jour', label: 'Plats du jour', icone: 'Flame' },
  { id: 'burgers', label: 'Burgers', icone: 'UtensilsCrossed' },
  { id: 'accompagnements', label: 'Accompagnements', icone: 'Salad' },
  { id: 'condiments', label: 'Condiments', icone: 'Droplets' },
  { id: 'boissons', label: 'Boissons', icone: 'CupSoda' },
  { id: 'desserts', label: 'Desserts', icone: 'Cake' },
];