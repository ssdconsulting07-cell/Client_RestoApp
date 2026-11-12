import { UtensilsCrossed, CupSoda, Cake, Salad, Droplets, Sandwich } from 'lucide-react';

// Icone d'une categorie publiee par le Gerant, deduite de son nom (les
// categories sont libres cote Manager : repli sur une icone generique).
export function IconeCategorie({ nom, size = 20 }) {
  const n = String(nom || '').toLowerCase();
  if (n.includes('burger')) return <Sandwich size={size} aria-hidden="true" />;
  if (n.includes('boisson') || n.includes('jus')) return <CupSoda size={size} aria-hidden="true" />;
  if (n.includes('dessert')) return <Cake size={size} aria-hidden="true" />;
  if (n.includes('accompagnement') || n.includes('salade')) return <Salad size={size} aria-hidden="true" />;
  if (n.includes('sauce') || n.includes('condiment')) return <Droplets size={size} aria-hidden="true" />;
  return <UtensilsCrossed size={size} aria-hidden="true" />;
}
