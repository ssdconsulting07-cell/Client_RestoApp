import { NavLink } from 'react-router-dom';

const onglets = [
  { to: '/', label: 'Accueil', icon: '🏠' },
  { to: '/menu', label: 'Menu', icon: '🍔' },
  { to: '/commandes', label: 'Mes commandes', icon: '📦' },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-line flex justify-around items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {onglets.map((o) => (
        <NavLink
          key={o.to}
          to={o.to}
          end={o.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-ink-light'
            }`
          }
        >
          <span className="text-xl">{o.icon}</span>
          <span>{o.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}