import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function BoutonTheme() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="w-10 h-10 rounded-full bg-surface dark:bg-slate-800 border border-line dark:border-slate-700 shadow-card flex items-center justify-center active:scale-95 transition-transform"
    >
      {theme === 'dark' ? (
        <Sun size={20} strokeWidth={2} className="text-accent" />
      ) : (
        <Moon size={20} strokeWidth={2} className="text-ink" />
      )}
    </button>
  );
}