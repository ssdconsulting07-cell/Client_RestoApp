import { useEffect, useState } from 'react';
import { X, Flame } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { JOURS_SEMAINE, jourCourant, jourLabel } from '../utils/jours';
import ProduitCarte from './ProduitCarte';

export default function ModalPlatsDuJour({ ouvert, onFermer, plats, onAjouter }) {
  const aujourdhui = jourCourant();
  const [jour, setJour] = useState(aujourdhui);
  const [visible, setVisible] = useState(false);

  useScrollLock(ouvert);

  useEffect(() => {
    if (ouvert) {
      setJour(jourCourant());
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    return undefined;
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  // Sur petit ecran, l'onglet du jour (ex. Jeudi) peut etre hors champ : on
  // fait defiler la barre d'onglets pour le montrer.
  const centrerOnglet = (el) => {
    if (!el) return;
    const barre = el.closest('[data-onglets]');
    if (!barre) return;
    barre.scrollLeft = el.offsetLeft - (barre.clientWidth - el.offsetWidth) / 2;
  };

  const platsDuJourChoisi = plats.filter((p) => p.jour === jour);
  const estAujourdhui = jour === aujourdhui;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-plats-du-jour"
      className={`fixed inset-0 z-[200] flex items-end justify-center bg-black/70 transition-opacity duration-300 sm:items-center sm:p-4 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onFermer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl transition-transform duration-300 ease-out sm:max-w-2xl sm:rounded-3xl ${
          visible ? 'translate-y-0' : 'translate-y-full sm:translate-y-6'
        }`}
      >
        <div className="relative shrink-0 bg-gradient-to-br from-primary to-primary-dark px-5 pb-4 pt-5 text-white">
          <button
            type="button"
            onClick={onFermer}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/90">
            <Flame size={14} aria-hidden="true" /> Programme de la semaine
          </p>
          <h2 id="titre-plats-du-jour" className="text-2xl font-bold">Plats du jour</h2>
        </div>

        {/* Jours : defilement horizontal, sans deborder de l'ecran */}
        <div data-onglets className="relative shrink-0 overflow-x-auto scroll-smooth border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 px-4 py-3" role="tablist" aria-label="Jour de la semaine">
            {JOURS_SEMAINE.map((j) => {
              const nb = plats.filter((p) => p.jour === j.id).length;
              const actif = j.id === jour;
              return (
                <button
                  key={j.id}
                  ref={actif ? centrerOnglet : undefined}
                  type="button"
                  role="tab"
                  aria-selected={actif}
                  onClick={() => setJour(j.id)}
                  className={`min-h-10 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                    actif ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink'
                  } ${nb === 0 && !actif ? 'opacity-50' : ''}`}
                >
                  {j.id === aujourdhui ? "Aujourd'hui" : j.nom}
                  {nb > 0 && <span className="ml-1 opacity-75">({nb})</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!estAujourdhui && platsDuJourChoisi.length > 0 && (
            <p className="mb-3 rounded-xl bg-surface px-3 py-2 text-xs text-ink-light">
              Ces plats se commandent uniquement le {jourLabel(jour).toLowerCase()}.
            </p>
          )}
          {platsDuJourChoisi.length === 0 ? (
            <p className="py-12 text-center text-sm italic text-ink-light">
              Aucun plat du jour prévu {estAujourdhui ? "aujourd'hui" : `le ${jourLabel(jour).toLowerCase()}`}.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {platsDuJourChoisi.map((p) => (
                <ProduitCarte
                  key={p.id}
                  produit={p}
                  categorieNom="Plat du jour"
                  onAjouter={onAjouter}
                  desactive={!estAujourdhui}
                  mentionIndispo={`Le ${jourLabel(p.jour).toLowerCase()}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
