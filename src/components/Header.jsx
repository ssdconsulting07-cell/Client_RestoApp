import BoutonNotif from './BoutonNotif';

export default function Header({ titre, sousTitre, avecNotif = true }) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-ink sm:text-2xl">{titre}</h1>
        {sousTitre && <p className="mt-1 line-clamp-2 text-xs text-ink-light">{sousTitre}</p>}
      </div>
      {avecNotif && (
        <div className="shrink-0">
          <BoutonNotif />
        </div>
      )}
    </header>
  );
}
