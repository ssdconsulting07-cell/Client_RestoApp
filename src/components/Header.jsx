import BoutonNotif from './BoutonNotif';

export default function Header({ titre, sousTitre }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-ink truncate">
          {titre}
        </h1>
        {sousTitre && (
          <p className="text-xs text-ink-light mt-1 line-clamp-2">
            {sousTitre}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <BoutonNotif />
      </div>
    </header>
  );
}