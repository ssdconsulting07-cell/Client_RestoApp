import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import TopBar from './TopBar';
import NotifPopup from './NotifPopup';
import ScrollEnHaut from './ScrollEnHaut';
import AideSheet from './AideSheet';

// Smartphone (< 768 px) : onglets en bas, a portee de pouce.
// Tablette / ordinateur (>= 768 px) : barre de navigation en haut.
export default function Layout() {
  // Tunnel de commande : pas d'onglets mais une barre d'action plus haute
  // (bouton + aide) fixee en bas sur smartphone.
  const { pathname } = useLocation();
  const [aide, setAide] = useState(false);
  const fermerAide = useCallback(() => setAide(false), []);
  const reserveBas = pathname === '/confirmation' ? 'pb-[calc(7.5rem+env(safe-area-inset-bottom))]' : 'pb-[calc(5rem+env(safe-area-inset-bottom))]';
  return (
    <>
      <ScrollEnHaut />
      <TopBar />
      {/* Colonne pleine hauteur : la version reste collee en bas de l'ecran
          meme quand la page est courte (panier vide, etc.). */}
      <div className={`flex min-h-dvh flex-col ${reserveBas} md:min-h-[calc(100dvh-4rem-1px)] md:pb-4`}>
        <div className="flex-1">
          <Outlet />
        </div>
        {/* Pied de page discret : version a gauche, aide a droite (meme
            couleur, pour ne pas concurrencer le contenu). */}
        <footer className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pb-2 pt-6 text-[11px] text-ink-light/80 sm:px-6">
          <span>v{__APP_VERSION__}</span>
          <button
            type="button"
            onClick={() => setAide(true)}
            aria-haspopup="dialog"
            className="-my-2 min-h-9 px-1 underline-offset-2 hover:underline"
          >
            Besoin d’aide ?
          </button>
        </footer>
      </div>
      <NavBar />
      <NotifPopup />
      <AideSheet ouvert={aide} onFermer={fermerAide} />
    </>
  );
}
