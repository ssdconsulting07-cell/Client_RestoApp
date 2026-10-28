import { Truck, Store, MapPin, ChevronRight } from 'lucide-react';
import AnimationAttente from './AnimationAttente';
import AnimationPreparation from './AnimationPreparation';
import CarteLivreur from './CarteLivreur';
import { formatPrix } from '../utils/format';
import { tempsRelatif } from '../utils/date';

const MODES = {
  livraison: { label: 'Livraison', Icone: Truck },
  'sur-place': { label: 'Sur place', Icone: MapPin },
  'a-emporter': { label: 'À emporter', Icone: Store },
};

export default function CommandeActive({ commande, onVoirToutes }) {
  const mode = MODES[commande.mode] || MODES.livraison;
  const IconeMode = mode.Icone;

  const totalArticles = commande.articles.reduce((n, a) => n + a.quantite, 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      {/* En-tête */}
      <div className="border-b border-line bg-gradient-to-br from-primary/5 to-transparent px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Commande en cours
            </p>
            <p className="mt-0.5 text-sm font-bold text-ink">#{commande.id}</p>
          </div>
          <span className="text-[11px] text-ink-light">
            {tempsRelatif(commande.date)}
          </span>
        </div>
      </div>

      {/* Animation selon le statut */}
      <div className="px-4 py-4">
        {commande.statut === 'en-attente' && <AnimationAttente />}
        {commande.statut === 'en-preparation' && <AnimationPreparation />}
        {commande.statut === 'en-livraison' && (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <Truck size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-blue-600">En livraison</p>
              <p className="mt-0.5 text-xs text-ink-light line-clamp-1">
                Votre livreur est en route
              </p>
            </div>
          </div>
        )}

        {/* Carte livreur (seulement si en livraison) */}
        {commande.statut === 'en-livraison' && (
          <CarteLivreur livreur={commande.livreur} />
        )}
      </div>

      {/* Résumé articles */}
      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-ink-light">
            <IconeMode size={13} className="text-primary" />
            <span>{mode.label}</span>
            <span>·</span>
            <span>
              {totalArticles} article{totalArticles > 1 ? 's' : ''}
            </span>
          </div>
          <span className="font-bold text-primary">
            {formatPrix(commande.total)}
          </span>
        </div>
      </div>

      {/* Bouton voir toutes */}
      {onVoirToutes && (
        <button
          onClick={onVoirToutes}
          className="flex w-full items-center justify-between gap-2 border-t border-line bg-surface-alt px-4 py-3 text-sm font-semibold text-ink transition hover:bg-primary/5"
        >
          <span>Voir toutes mes commandes</span>
          <ChevronRight size={16} className="text-ink-light" />
        </button>
      )}
    </div>
  );
}