import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrix } from '../utils/format';
import BoutonNotif from './BoutonNotif';

const liens = [
  { to: '/', label: 'Accueil' },
  { to: '/menu', label: 'Menu' },
  { to: '/commandes', label: 'Mes commandes' },
];

// Navigation tablette / ordinateur (>= 768 px) : barre fixe en haut, comme un
// site de commande, a la place des onglets du bas propres au smartphone.
export default function TopBar() {
  const { nbArticles, total } = useCart();

  return (
    <header className="sticky top-0 z-[100] hidden border-b border-line bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6 lg:gap-6">
        <Link to="/" aria-label="SenYummies — accueil" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-white">SY</span>
          <span className="hidden text-lg font-bold tracking-tight lg:inline">
            SEN<span className="text-primary">YUMMIES</span>
          </span>
        </Link>

        <nav aria-label="Menu principal" className="flex flex-1 items-center gap-1">
          {liens.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors lg:px-4 ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-ink-light hover:bg-surface-alt hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <BoutonNotif />
          <NavLink
            to="/panier"
            className={({ isActive }) =>
              `relative inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                isActive ? 'bg-primary-dark text-white' : 'bg-primary text-white hover:bg-primary-dark'
              }`
            }
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span>{nbArticles > 0 ? formatPrix(total) : 'Panier'}</span>
            {nbArticles > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-primary">
                {nbArticles > 99 ? '99+' : nbArticles}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
