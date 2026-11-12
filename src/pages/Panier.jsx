import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Utensils, AlertTriangle, ImageOff } from 'lucide-react';
import { useCart, prixUnitaireLigne } from '../context/CartContext';
import { useCatalogue } from '../context/CatalogueContext';
import { formatPrix } from '../utils/format';
import { jourCourant } from '../utils/jours';
import Header from '../components/Header';
import AccompagnementSheet from '../components/AccompagnementSheet';

export default function Panier() {
  const navigate = useNavigate();
  const { lignes, changerQuantite, retirer, choisirAccompagnement, actualiser, total, nbArticles, vider } = useCart();
  const { produits, platsDuJour, accompagnements, chargement, erreur } = useCatalogue();
  const [ligneOuverteId, setLigneOuverteId] = useState(null);

  // Recale le panier sur le catalogue publie (prix, rupture, plat du jour
  // d'un autre jour, accompagnement retire) des que le catalogue est charge.
  useEffect(() => {
    if (chargement || erreur) return;
    const aujourdhui = jourCourant();
    actualiser(
      (l) =>
        l.type === 'PLAT_DU_JOUR'
          ? platsDuJour.find((p) => p.id === l.produitId && p.jour === aujourdhui)
          : produits.find((p) => p.id === l.produitId),
      (id) => accompagnements.find((a) => a.id === id)
    );
  }, [chargement, erreur, produits, platsDuJour, accompagnements, actualiser]);

  const fermerSheet = useCallback(() => setLigneOuverteId(null), []);
  const ligneOuverte = lignes.find((l) => l.ligneId === ligneOuverteId) || null;
  const indisponibles = lignes.filter((l) => l.indisponible);

  if (lignes.length === 0) {
    return (
      <div className="mx-auto max-w-app px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Header titre="Panier" />
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-card">
            <ShoppingCart size={36} strokeWidth={1.5} className="text-ink-light" aria-hidden="true" />
          </div>
          <p className="mb-1 text-lg font-semibold">Votre panier est vide</p>
          <p className="mb-6 max-w-xs text-sm text-ink-light">
            Parcourez notre menu et ajoutez vos plats préférés en quelques clics.
          </p>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="min-h-12 rounded-xl bg-primary px-6 font-semibold text-white"
          >
            Voir le menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-app px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Header titre="Panier" sousTitre={`${nbArticles} article${nbArticles > 1 ? 's' : ''}`} />

      {indisponibles.length > 0 && (
        <div className="mb-4 flex gap-3 rounded-2xl border border-danger/30 bg-red-50 p-3 text-sm text-danger" role="alert">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            {indisponibles.length === 1 ? 'Un article n’est' : `${indisponibles.length} articles ne sont`} plus disponible
            {indisponibles.length > 1 ? 's' : ''}. Retirez-
            {indisponibles.length > 1 ? 'les' : 'le'} pour continuer.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {lignes.map((l) => (
          <li
            key={l.ligneId}
            className={`overflow-hidden rounded-2xl border bg-surface shadow-card ${l.indisponible ? 'border-danger/40' : 'border-line'}`}
          >
            <div className="flex gap-3 p-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                {l.photoUrl ? (
                  <img src={l.photoUrl} alt="" className={`h-full w-full object-cover ${l.indisponible ? 'grayscale' : ''}`} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-light/60">
                    <ImageOff size={22} aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">{l.nom}</p>
                    {l.type === 'PLAT_DU_JOUR' && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Plat du jour</p>
                    )}
                    <p className="mt-0.5 text-xs text-ink-light">
                      {l.indisponible ? (
                        <span className="font-semibold text-danger">Plus disponible</span>
                      ) : (
                        `${formatPrix(prixUnitaireLigne(l))} / unité`
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => retirer(l.ligneId)}
                    className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-light hover:text-danger"
                    aria-label={`Retirer ${l.nom}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <div className="flex items-center rounded-full border border-line bg-surface-alt">
                    <button
                      type="button"
                      onClick={() => changerQuantite(l.ligneId, -1)}
                      className="flex h-9 w-9 items-center justify-center active:scale-90"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-semibold" aria-live="polite">{l.quantite}</span>
                    <button
                      type="button"
                      onClick={() => changerQuantite(l.ligneId, 1)}
                      disabled={l.indisponible}
                      className="flex h-9 w-9 items-center justify-center active:scale-90 disabled:opacity-30"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="ml-auto whitespace-nowrap text-sm font-bold text-primary">
                    {formatPrix(prixUnitaireLigne(l) * l.quantite)}
                  </span>
                </div>
              </div>
            </div>

            {l.accompagnementEligible && !l.indisponible && accompagnements.length > 0 && (
              <button
                type="button"
                onClick={() => setLigneOuverteId(l.ligneId)}
                className={`flex min-h-11 w-full items-center gap-2 border-t border-line px-3 text-left text-xs font-semibold ${
                  l.accompagnementNom ? 'bg-primary/5 text-primary' : 'text-ink-light'
                }`}
              >
                <Utensils size={14} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  {l.accompagnementNom
                    ? `Accompagnement : ${l.accompagnementNom}${l.accompagnementPrix > 0 ? ` (+ ${formatPrix(l.accompagnementPrix)})` : ''}`
                    : 'Ajouter un accompagnement'}
                </span>
                <span className="shrink-0 underline">{l.accompagnementNom ? 'Modifier' : 'Choisir'}</span>
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-surface p-4 shadow-card">
        <div className="flex justify-between py-1.5 text-sm">
          <span className="text-ink-light">Sous-total</span>
          <span className="font-semibold">{formatPrix(total)}</span>
        </div>
        <div className="flex justify-between gap-3 py-1.5 text-sm">
          <span className="text-ink-light">Livraison</span>
          <span className="text-right text-xs italic text-ink-light">Selon votre zone, à l'étape suivante</span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={vider}
          className="min-h-12 rounded-xl border border-line px-4 text-sm text-ink-light hover:border-danger hover:text-danger"
        >
          Vider
        </button>
        <button
          type="button"
          onClick={() => navigate('/confirmation')}
          disabled={indisponibles.length > 0}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white disabled:opacity-50"
        >
          Commander · {formatPrix(total)} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      <AccompagnementSheet
        ligne={ligneOuverte}
        accompagnements={accompagnements}
        onChoisir={(acc) => {
          choisirAccompagnement(ligneOuverteId, acc);
          fermerSheet();
        }}
        onFermer={fermerSheet}
      />
    </div>
  );
}
