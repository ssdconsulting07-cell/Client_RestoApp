import { NavLink, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext';

const onglets = [
  { to: '/', label: 'Accueil', Icon: Home },
  { to: '/menu', label: 'Menu', Icon: UtensilsCrossed },
  { to: '/panier', label: 'Panier', Icon: ShoppingCart, showBadge: true },
  { to: '/commandes', label: 'Commandes', Icon: Receipt },
];

export default function NavBar() {
  const { nbArticles } = useCart();
  const { pathname } = useLocation();

  // Pendant la commande (etapes livraison / coordonnees / paiement), la barre
  // d'action de la page prend sa place : parcours sans distraction.
  if (pathname === '/confirmation') return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-[100] border-t md:hidden border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {onglets.map(({ to, label, Icon, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                isActive ? 'font-semibold text-primary' : 'text-ink-light'
              }`
            }
          >
            <span className="relative">
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
              {showBadge && nbArticles > 0 && (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {nbArticles > 99 ? '99+' : nbArticles}
                </span>
              )}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
