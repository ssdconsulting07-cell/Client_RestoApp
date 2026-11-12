import { useEffect, useMemo, useState } from 'react';
import { X, ChevronRight, Check, Search } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { formatPrix } from '../utils/format';

// Choix de la zone de livraison : feuille du bas sur smartphone, fenetre
// centree sur tablette / ordinateur. Meme presentation que la page Zones de
// livraison du Gerant (Manager, ZonesLivraison.jsx) : departements replies
// par defaut, chevron qui pivote, resume "N zones · prix min – max".
const normaliser = (s) =>
  String(s || '').toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function ZoneSheet({ ouvert, onFermer, regions, secteurs, valeur, onChoisir }) {
  const [regionId, setRegionId] = useState('');
  const [recherche, setRecherche] = useState('');
  const [ouverts, setOuverts] = useState(() => new Set());
  const [visible, setVisible] = useState(false);

  useScrollLock(ouvert);

  // A l'ouverture : region de la zone deja choisie (sinon la premiere), et
  // son departement deplie pour la retrouver tout de suite.
  useEffect(() => {
    if (!ouvert) {
      setVisible(false);
      return undefined;
    }
    const choisie = secteurs.find((s) => s.id === valeur);
    setRegionId(choisie?.regionId || regions[0]?.id || '');
    setOuverts(new Set(choisie ? [choisie.departement] : []));
    setRecherche('');
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [ouvert]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onFermer]);

  const groupes = useMemo(() => {
    const q = normaliser(recherche.trim());
    const map = new Map();
    for (const s of secteurs) {
      if (s.regionId !== regionId) continue;
      if (q && !normaliser(`${s.nom} ${s.departement}`).includes(q)) continue;
      if (!map.has(s.departement)) map.set(s.departement, []);
      map.get(s.departement).push(s);
    }
    return [...map.entries()];
  }, [secteurs, regionId, recherche]);

  if (!ouvert) return null;

  const basculer = (dep) =>
    setOuverts((courant) => {
      const suivant = new Set(courant);
      if (suivant.has(dep)) suivant.delete(dep);
      else suivant.add(dep);
      return suivant;
    });

  const enRecherche = recherche.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-zone"
      className={`fixed inset-0 z-[260] flex items-end justify-center bg-black/60 transition-opacity duration-200 md:items-center md:p-6 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onFermer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-float transition-transform duration-300 ease-out md:max-h-[80vh] md:max-w-lg md:rounded-3xl ${
          visible ? 'translate-y-0' : 'translate-y-full md:translate-y-4'
        }`}
      >
        <div className="flex justify-center pb-1 pt-3 md:hidden" aria-hidden="true">
          <div className="h-1.5 w-12 rounded-full bg-ink/15" />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-2 md:pt-5">
          <div className="min-w-0">
            <h2 id="titre-zone" className="text-lg font-semibold">Zone de livraison</h2>
            <p className="mt-0.5 text-xs text-ink-light">Le prix de la livraison dépend de votre zone.</p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt"
          >
            <X size={18} />
          </button>
        </div>

        <div className="shrink-0 space-y-3 border-b border-line px-5 pb-4">
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-primary">
            <Search size={18} className="shrink-0 text-ink-light" aria-hidden="true" />
            <span className="sr-only">Rechercher une zone</span>
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une zone"
              className="min-w-0 flex-1 bg-transparent py-2 outline-none"
            />
          </label>
          {regions.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Région">
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={r.id === regionId}
                  onClick={() => setRegionId(r.id)}
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                    r.id === regionId ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink'
                  }`}
                >
                  {r.nom}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {groupes.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-light">Aucune zone ne correspond à votre recherche.</p>
          ) : (
            groupes.map(([dep, liste]) => {
              const estOuvert = enRecherche || ouverts.has(dep);
              const prix = liste.map((s) => s.prixLivraison);
              const min = Math.min(...prix);
              const max = Math.max(...prix);
              return (
                <div key={dep} className="mb-2.5">
                  <button
                    type="button"
                    aria-expanded={estOuvert}
                    onClick={() => basculer(dep)}
                    className="flex min-h-12 w-full flex-wrap items-center gap-x-2.5 gap-y-0.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-left transition-colors hover:border-primary/40"
                  >
                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                      className={`shrink-0 text-primary transition-transform duration-150 ${estOuvert ? 'rotate-90' : ''}`}
                    />
                    <span className="text-sm font-bold uppercase tracking-wide">{dep}</span>
                    <span className="ml-auto text-xs text-ink-light">
                      {liste.length} zone{liste.length > 1 ? 's' : ''} · {formatPrix(min)}
                      {min !== max ? ` – ${formatPrix(max)}` : ''}
                    </span>
                  </button>
                  {estOuvert && (
                    <ul className="mt-2 space-y-1.5 pl-2">
                      {liste.map((s) => {
                        const actif = s.id === valeur;
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => onChoisir(s)}
                              aria-pressed={actif}
                              className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 text-left text-sm transition-colors ${
                                actif ? 'border-primary bg-primary/5 font-semibold' : 'border-line bg-surface-alt hover:border-primary/40'
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate">{s.nom}</span>
                              <span className="shrink-0 text-xs font-semibold text-ink-light">{formatPrix(s.prixLivraison)}</span>
                              {actif && <Check size={16} className="shrink-0 text-primary" aria-hidden="true" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
