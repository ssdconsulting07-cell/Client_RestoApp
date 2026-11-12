import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { useNotif } from '../context/NotifContext';
import useScrollLock from '../hooks/useScrollLock';

// Rendu identique a l'apercu du Gerant (Manager, AnnoncePopupPreview.jsx) :
// une sequence de slides (toutes les chaines actives a la suite), photo +
// titre en surimpression, message, navigation precedent / suivant avec le
// titre de la chaine et la position "n/total".
export default function NotifPopup() {
  const { ouvert, fermer, chaines } = useNotif();
  const [index, setIndex] = useState(0);

  useScrollLock(ouvert);

  const sequence = useMemo(
    () => chaines.flatMap((chaine) => chaine.slides.map((slide) => ({ chaine, slide }))),
    [chaines]
  );

  useEffect(() => {
    if (ouvert) setIndex(0);
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft') setIndex((i) => i - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ouvert, fermer]);

  if (!ouvert) return null;

  const total = sequence.length;
  const courant = total ? sequence[((index % total) + total) % total] : null;
  const position = total ? (((index % total) + total) % total) + 1 : 0;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={fermer}
      role="dialog"
      aria-modal="true"
      aria-label="Annonces"
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface shadow-float sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {courant ? (
          <>
            <div className="relative aspect-[16/10] w-full shrink-0 bg-primary">
              {courant.slide.imageUrl ? (
                <img src={courant.slide.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/80">
                  <Megaphone size={56} strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <h2 className="absolute inset-x-4 bottom-4 text-lg font-bold leading-snug text-white sm:text-xl">
                {courant.slide.titre}
              </h2>
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {courant.slide.message && (
              <div className="overflow-y-auto px-5 py-4">
                <p className="text-sm leading-6 text-ink-light">{courant.slide.message}</p>
              </div>
            )}

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                aria-label="Annonce précédente"
                disabled={total < 2}
                onClick={() => setIndex((i) => i - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-ink-light" title={courant.chaine.titre}>
                {courant.chaine.titre} · {position}/{total}
              </span>
              <button
                type="button"
                aria-label="Annonce suivante"
                disabled={total < 2}
                onClick={() => setIndex((i) => i + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center">
            <Megaphone size={40} strokeWidth={1.5} className="mx-auto mb-3 text-ink-light" />
            <p className="text-sm text-ink-light">Aucune annonce pour le moment.</p>
            <button
              type="button"
              onClick={fermer}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
