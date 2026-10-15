import { useState } from 'react';
import { ChevronDown, RotateCcw, Truck, Store, MapPin } from 'lucide-react';
import BadgeStatut from './BadgeStatut';
import { formatPrix } from '../utils/format';
import { formatDateHeure, tempsRelatif } from '../utils/date';

const MODES = {
  livraison: { label: 'Livraison', Icone: Truck },
  'sur-place': { label: 'Sur place', Icone: MapPin },
  'a-emporter': { label: 'À emporter', Icone: Store },
};

export default function CardCommande({ commande, onCommander, onAnnuler }) {
  const [ouvert, setOuvert] = useState(false);
  const mode = MODES[commande.mode] || MODES.livraison;
  const IconeMode = mode.Icone;

  const totalArticles = commande.articles.reduce((n, a) => n + a.quantite, 0);
  const peutAnnuler = ['en-attente'].includes(commande.statut);
  const peutRecommander = ['livree', 'validee', 'annulee'].includes(commande.statut);

  return (
    <div className="bg-surface rounded-lg shadow-card overflow-hidden">
      {/* En-tête cliquable */}
      <button
        onClick={() => setOuvert((v) => !v)}
        className="w-full text-left p-3 sm:p-4 flex items-start justify-between gap-2 sm:gap-3 hover:bg-primary/5 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <p className="text-xs font-bold text-ink truncate">#{commande.id}</p>
            <BadgeStatut statut={commande.statut} />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-ink-light mb-1 flex-wrap">
            <IconeMode size={13} className="text-primary shrink-0" />
            <span>{mode.label}</span>
            <span>·</span>
            <span>{tempsRelatif(commande.date)}</span>
          </div>
          <p className="text-xs text-ink-light">
            {totalArticles} article{totalArticles > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="font-bold text-primary text-sm whitespace-nowrap">
            {formatPrix(commande.total)}
          </span>
          <ChevronDown
            size={16}
            className={`text-ink-light transition-transform ${
              ouvert ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Détails */}
      {ouvert && (
        <div className="border-t border-line px-3 sm:px-4 py-3 bg-primary/5">
          {/* Date exacte */}
          <p className="text-[11px] text-ink-light mb-3">
            Passée le {formatDateHeure(commande.date)}
          </p>

          {/* Articles */}
          <div className="space-y-2.5">
            {commande.articles.map((a) => (
              <div key={a.id} className="flex items-center gap-2 sm:gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={a.photo}
                    alt={a.nom}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {a.quantite}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink line-clamp-1">
                    {a.nom}
                  </p>
                  <p className="text-[11px] text-ink-light truncate">
                    {formatPrix(a.prix)} × {a.quantite}
                  </p>
                </div>
                <span className="text-xs font-semibold text-ink whitespace-nowrap">
                  {formatPrix(a.prix * a.quantite)}
                </span>
              </div>
            ))}
          </div>

          {/* Total ligne */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-line">
            <span className="text-xs font-semibold text-ink">Total</span>
            <span className="text-sm font-bold text-primary">
              {formatPrix(commande.total)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            {peutRecommander && (
              <button
                onClick={() => onCommander(commande)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary rounded-md py-2.5 px-3 hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
              >
                <RotateCcw size={14} className="shrink-0" />
                <span className="truncate">Commander à nouveau</span>
              </button>
            )}
            {peutAnnuler && (
              <button
                onClick={() => onAnnuler(commande)}
                className="flex-1 text-xs font-semibold text-danger border border-danger rounded-md py-2.5 px-3 hover:bg-danger hover:text-white transition-colors whitespace-nowrap"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}