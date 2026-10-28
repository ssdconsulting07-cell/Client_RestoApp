import { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw, Truck, Store, MapPin } from 'lucide-react';
import { formatPrix } from '../utils/format';
import { tempsRelatif, formatDateHeure } from '../utils/date';
import { CONFIG_STATUTS } from '../data/commandes';

const MODES = {
  livraison: { label: 'Livraison', Icone: Truck },
  'sur-place': { label: 'Sur place', Icone: MapPin },
  'a-emporter': { label: 'À emporter', Icone: Store },
};

export default function ListeCommandes({ commandes, activeId, onSelect, onCommander }) {
  return (
    <div className="space-y-2.5">
      {commandes.map((commande) => (
        <LigneCommande
          key={commande.id}
          commande={commande}
          estActive={commande.id === activeId}
          onSelect={() => onSelect(commande.id)}
          onCommander={onCommander}
        />
      ))}
    </div>
  );
}

function LigneCommande({ commande, estActive, onSelect, onCommander }) {
  const [ouvert, setOuvert] = useState(false);
  const mode = MODES[commande.mode] || MODES.livraison;
  const IconeMode = mode.Icone;
  const config = CONFIG_STATUTS[commande.statut] || CONFIG_STATUTS['en-attente'];
  const totalArticles = commande.articles.reduce((n, a) => n + a.quantite, 0);

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-surface transition ${
        estActive ? 'border-primary shadow-card' : 'border-line'
      }`}
    >
      <div className="flex items-stretch">
        <button
          onClick={onSelect}
          className="flex flex-1 items-start justify-between gap-2 px-3 py-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs font-bold text-ink">#{commande.id}</p>
              <span className={`text-[10px] font-bold ${config.couleur}`}>
                · {config.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-light">
              <IconeMode size={11} className="text-primary shrink-0" />
              <span>{mode.label}</span>
              <span>·</span>
              <span>{totalArticles} article{totalArticles > 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{tempsRelatif(commande.date)}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-primary whitespace-nowrap">
            {formatPrix(commande.total)}
          </span>
        </button>

        <button
          onClick={() => setOuvert((v) => !v)}
          className="flex w-10 items-center justify-center border-l border-line text-ink-light"
          aria-label="Détails"
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${ouvert ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {ouvert && (
        <div className="border-t border-line bg-primary/5 px-3 py-3">
          <p className="mb-2 text-[10px] text-ink-light">
            Passée le {formatDateHeure(commande.date)}
          </p>
          <div className="space-y-2">
            {commande.articles.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  <img
                    src={a.photo}
                    alt={a.nom}
                    className="h-8 w-8 rounded object-cover"
                  />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {a.quantite}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-ink">
                    {a.nom}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-ink whitespace-nowrap">
                  {formatPrix(a.prix * a.quantite)}
                </span>
              </div>
            ))}
          </div>

          {commande.statut === 'livree' && (
            <button
              onClick={() => onCommander(commande)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-primary py-2 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              <RotateCcw size={12} />
              Commander à nouveau
            </button>
          )}

          <button
            onClick={onSelect}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-[11px] font-bold text-white transition hover:brightness-110"
          >
            Afficher en détail
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}