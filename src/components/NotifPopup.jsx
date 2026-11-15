import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { useNotif } from '../context/NotifContext';
import useScrollLock from '../hooks/useScrollLock';

// Nouveautes du Gerant : toutes les chaines actives a la suite (la derniere
// publiee d'abord), chaque chaine etant une suite de nouveautes (slides).
// Carrousel automatique (5 s par nouveaute) ET manipulable : fleches,
// balayage du doigt, clavier, points ; toute action met le defilement en
// pause quelques secondes. Sur smartphone : feuille du bas, photo en haut ;
// sur tablette et ordinateur : fenetre compacte, photo a gauche et texte a
// droite pour que le message reste lisible.
const DUREE = 5000;
const PAUSE_APRES_ACTION = 8000;

export default function NotifPopup() {
  const { ouvert, fermer, chaines } = useNotif();
  const [index, setIndex] = useState(0);
  const [pauseJusqua, setPauseJusqua] = useState(0);
  const [survol, setSurvol] = useState(false);
  const toucher = useRef(null);
  useScrollLock(ouvert);

  const sequence = useMemo(
    () =>
      chaines.flatMap((chaine, numChaine) =>
        chaine.slides.map((slide, numSlide) => ({ chaine, slide, numChaine, numSlide }))
      ),
    [chaines]
  );
  const total = sequence.length;
  const pos = total ? ((index % total) + total) % total : 0;
  const courant = total ? sequence[pos] : null;

  const aller = useCallback((delta) => {
    setIndex((i) => i + delta);
    setPauseJusqua(Date.now() + PAUSE_APRES_ACTION);
  }, []);

  useEffect(() => {
    if (ouvert) setIndex(0);
  }, [ouvert]);

  // Defilement automatique (sauf survol, pause apres action, une seule slide).
  useEffect(() => {
    if (!ouvert || total < 2 || survol) return undefined;
    const attente = Math.max(DUREE, pauseJusqua - Date.now());
    const t = setTimeout(() => setIndex((i) => i + 1), attente);
    return () => clearTimeout(t);
  }, [ouvert, total, survol, pauseJusqua, index]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') aller(1);
      if (e.key === 'ArrowLeft') aller(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ouvert, fermer, aller]);

  if (!ouvert) return null;

  const debutToucher = (e) => {
    toucher.current = e.touches[0].clientX;
  };
  const finToucher = (e) => {
    if (toucher.current === null) return;
    const dx = e.changedTouches[0].clientX - toucher.current;
    toucher.current = null;
    if (Math.abs(dx) > 40) aller(dx < 0 ? 1 : -1);
  };

  // Points : nouveautes de la chaine courante ; libelle : chaine n / total.
  const slidesChaine = courant ? courant.chaine.slides.length : 0;
  const debutChaine = courant ? pos - courant.numSlide : 0;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
      onClick={fermer}
      role="dialog"
      aria-modal="true"
      aria-label="Nouveautés"
    >
      <div
        className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-float sm:max-h-[min(70dvh,460px)] sm:max-w-2xl sm:flex-row sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        onTouchStart={debutToucher}
        onTouchEnd={finToucher}
      >
        <button
          type="button"
          onClick={fermer}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-95 sm:bg-surface-alt sm:text-ink"
        >
          <X size={20} />
        </button>

        {courant ? (
          <>
            <div className="relative aspect-[16/10] max-h-[38dvh] w-full shrink-0 bg-primary sm:aspect-auto sm:max-h-none sm:w-[45%]">
              {courant.slide.imageUrl ? (
                <img
                  key={`${pos}-${courant.slide.imageUrl}`}
                  src={courant.slide.imageUrl}
                  alt=""
                  className="h-full w-full animate-[fadeUp_0.4s_ease-out_both] object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/80">
                  <Megaphone size={56} strokeWidth={1.5} />
                </div>
              )}
              {total > 1 && (
                <div className="absolute inset-x-3 top-3 flex gap-1 sm:right-3" aria-hidden="true">
                  {Array.from({ length: slidesChaine }).map((_, i) => (
                    <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
                      <span
                        className={`block h-full rounded-full bg-white ${i < courant.numSlide ? 'w-full' : 'w-0'}`}
                        style={
                          i === courant.numSlide && !survol
                            ? { animation: `loading ${DUREE}ms linear forwards` }
                            : i === courant.numSlide
                              ? { width: '50%' }
                              : undefined
                        }
                        key={`${pos}-${i}`}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div key={pos} className="min-h-0 flex-1 animate-[fadeUp_0.35s_ease-out_both] overflow-y-auto px-5 pb-3 pt-4 sm:pr-14 sm:pt-6">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {courant.chaine.titre}
                  {chaines.length > 1 && (
                    <span className="ml-1 font-semibold text-ink-light">· nouveauté {courant.numChaine + 1}/{chaines.length}</span>
                  )}
                </p>
                <h2 className="text-lg font-bold leading-snug text-ink sm:text-xl">{courant.slide.titre}</h2>
                {courant.slide.message && (
                  <p className="mt-2 text-sm leading-6 text-ink-light">{courant.slide.message}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  aria-label="Nouveauté précédente"
                  disabled={total < 2}
                  onClick={() => aller(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Chaînes de nouveautés">
                  {chaines.length > 1
                    ? chaines.map((c, i) => (
                        <button
                          key={c.id}
                          type="button"
                          role="tab"
                          aria-selected={i === courant.numChaine}
                          aria-label={c.titre}
                          onClick={() => {
                            const cible = sequence.findIndex((x) => x.numChaine === i);
                            setIndex(cible);
                            setPauseJusqua(Date.now() + PAUSE_APRES_ACTION);
                          }}
                          className={`h-2.5 rounded-full transition-all ${i === courant.numChaine ? 'w-6 bg-primary' : 'w-2.5 bg-line'}`}
                        />
                      ))
                    : (
                        <span className="text-xs font-semibold text-ink-light">
                          {pos - debutChaine + 1}/{slidesChaine}
                        </span>
                      )}
                </div>
                <button
                  type="button"
                  aria-label="Nouveauté suivante"
                  disabled={total < 2}
                  onClick={() => aller(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center">
            <Megaphone size={40} strokeWidth={1.5} className="mx-auto mb-3 text-ink-light" />
            <p className="text-sm text-ink-light">Aucune nouveauté pour le moment.</p>
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
