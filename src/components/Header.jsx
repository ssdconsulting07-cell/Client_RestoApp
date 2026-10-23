import BoutonNotif from './BoutonNotif';

export default function Header({ titre, sousTitre }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{titre}</h1>
        {sousTitre && (
          <p className="text-xs text-ink-light mt-1">{sousTitre}</p>
        )}
      </div>
      <BoutonNotif />
    </header>
  );
}