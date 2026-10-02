import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Receipt } from 'lucide-react';

const onglets = [
  { to: '/', label: 'Accueil', Icon: Home },
  { to: '/menu', label: 'Menu', Icon: UtensilsCrossed },
  { to: '/commandes', label: 'Mes commandes', Icon: Receipt },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-line flex justify-around items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {onglets.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-ink-light'
            }`
          }
        >
          <Icon size={22} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}