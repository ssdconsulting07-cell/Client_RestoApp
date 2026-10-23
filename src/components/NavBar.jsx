import { NavLink } from 'react-router-dom';
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface dark:bg-dark-surface border-t border-line dark:border-dark-line flex justify-around items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {onglets.map(({ to, label, Icon, showBadge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-ink-light dark:text-dark-ink-light'
            }`
          }
        >
          <div className="relative">
            <Icon size={22} strokeWidth={2} />
            {showBadge && nbArticles > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-black rounded-full text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center px-1">
                {nbArticles}
              </span>
            )}
          </div>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}