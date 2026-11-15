import { useEffect, useState } from 'react';
import { X, Check, Utensils, Droplets } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { formatPrix } from '../utils/format';

// Choix des accompagnements d'une ligne (plusieurs possibles) — meme liste
// et meme regle de prix que la caisse (Manager, AccompagnementModal.jsx) :
// fiches "Accompagnements & condiments" ACTIF, prix ajoutes au prix du
// produit. Feuille du bas sur smartphone, fenetre centree sur tablette et
// ordinateur ; le bouton Valider reste toujours visible.
export default function AccompagnementSheet({ ligne, accompagnements, onValider, onFermer }) {
  const ouvert = Boolean(ligne);
  const [choisis, setChoisis] = useState([]);
  useScrollLock(ouvert);

  useEffect(() => {
    if (ligne) setChoisis((ligne.accompagnements || []).map((a) => a.id));
    // Reinitialise a chaque ouverture sur une ligne (pas a chaque rendu).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ligne?.ligneId]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  const options = [
    ...accompagnements.filter((a) => a.type === 'ACCOMPAGNEMENT'),
    ...accompagnements.filter((a) => a.type === 'CONDIMENT'),
  ];
  const basculer = (id) => setChoisis((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const selection = options.filter((a) => choisis.includes(a.id));
  const supplement = selection.reduce((s, a) => s + Number(a.prix || 0), 0);

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-accompagnement"
    >
      <div
        className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-float sm:max-h-[80dvh] sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="titre-accompagnement" className="text-base font-semibold sm:text-lg">Accompagnements</h2>
            <p className="mt-0.5 truncate text-xs text-ink-light sm:text-sm">
              Pour 1 × {ligne.nom} · plusieurs choix possibles
              {ligne.quantite > 1 ? ' (les autres unités gardent leur choix)' : ''}
            </p>
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

        <div className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2 sm:px-6" role="group" aria-label="Accompagnements">
          {options.map((a) => {
            const actif = choisis.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                role="checkbox"
                aria-checked={actif}
                onClick={() => basculer(a.id)}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors ${
                  actif ? 'border-primary bg-primary/5' : 'border-line bg-surface'
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-primary">
                  {a.type === 'CONDIMENT' ? <Droplets size={16} aria-hidden="true" /> : <Utensils size={16} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{a.nom}</span>
                  <span className="block text-xs font-semibold text-ink-light">
                    {a.prix > 0 ? `+ ${formatPrix(a.prix)}` : 'Offert'}
                  </span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                    actif ? 'border-primary bg-primary text-white' : 'border-line'
                  }`}
                  aria-hidden="true"
                >
                  {actif && <Check size={14} />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-line px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          {choisis.length > 0 && (
            <button
              type="button"
              onClick={() => setChoisis([])}
              className="min-h-12 rounded-xl border border-line px-3 text-sm text-ink-light"
            >
              Aucun
            </button>
          )}
          <button
            type="button"
            onClick={() => onValider(selection)}
            className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-white active:scale-[0.98]"
          >
            {selection.length === 0
              ? 'Sans accompagnement'
              : `Valider ${selection.length} choix${supplement > 0 ? ` · + ${formatPrix(supplement)}` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
