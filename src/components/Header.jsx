import BoutonNotif from './BoutonNotif';

// Titre de page. La cloche n'est affichee ici que sur smartphone : sur
// tablette et ordinateur, elle est dans la barre du haut (TopBar).
export default function Header({ titre, sousTitre, avecNotif = true }) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3 md:mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-ink sm:text-2xl lg:text-3xl">{titre}</h1>
        {sousTitre && <p className="mt-1 line-clamp-2 text-xs text-ink-light md:text-sm">{sousTitre}</p>}
      </div>
      {avecNotif && (
        <div className="shrink-0 md:hidden">
          <BoutonNotif />
        </div>
      )}
    </header>
  );
}
