import { useEffect } from 'react';
import { X, Check, Utensils, Droplets } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { formatPrix } from '../utils/format';

// Choix de l'accompagnement d'une ligne — meme liste et meme regle de prix
// que la caisse (Manager, AccompagnementModal.jsx / Vente.jsx) : fiches
// "Accompagnements & condiments" ACTIF, prix ajoute au prix du produit.
export default function AccompagnementSheet({ ligne, accompagnements, onChoisir, onFermer }) {
  const ouvert = Boolean(ligne);
  useScrollLock(ouvert);

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

  const Option = ({ actif, onClick, icone, libelle, prix }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors ${
        actif ? 'border-primary bg-primary/5' : 'border-line bg-surface'
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-primary">{icone}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{libelle}</span>
      <span className="shrink-0 text-xs font-semibold text-ink-light">{prix}</span>
      {actif && <Check size={18} className="shrink-0 text-primary" aria-hidden="true" />}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-accompagnement"
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface shadow-float sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-4">
          <div className="min-w-0">
            <h2 id="titre-accompagnement" className="text-base font-semibold">Accompagnement</h2>
            <p className="mt-0.5 truncate text-xs text-ink-light">
              Pour 1 × {ligne.nom}
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
        <div className="space-y-2 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Option
            actif={!ligne.accompagnementId}
            onClick={() => onChoisir(null)}
            icone={<X size={16} aria-hidden="true" />}
            libelle="Sans accompagnement"
            prix=""
          />
          {options.map((a) => (
            <Option
              key={a.id}
              actif={ligne.accompagnementId === a.id}
              onClick={() => onChoisir(a)}
              icone={a.type === 'CONDIMENT' ? <Droplets size={16} aria-hidden="true" /> : <Utensils size={16} aria-hidden="true" />}
              libelle={a.nom}
              prix={a.prix > 0 ? `+ ${formatPrix(a.prix)}` : 'Offert'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
