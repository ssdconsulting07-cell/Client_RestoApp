import BoutonNotif from './BoutonNotif';
import BoutonTheme from '../context/BoutonTheme';

export default function Header({ titre, sousTitre }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink dark:text-slate-50">
          {titre}
        </h1>
        {sousTitre && (
          <p className="text-xs text-ink-light dark:text-slate-400 mt-1">
            {sousTitre}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <BoutonTheme />
        <BoutonNotif />
      </div>
    </header>
  );
}