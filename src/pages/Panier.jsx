import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProduits } from '../api/menu';
import { formatPrix } from '../utils/format';
import Header from '../components/Header';

export default function Panier() {
  const navigate = useNavigate();
  const {
    items,
    ajouter,
    modifierQuantite,
    retirer,
    total,
    vider,
  } = useCart();

  const [accompagnements, setAccompagnements] = useState([]);

  useEffect(() => {
    getProduits()
      .then((produits) => {
        setAccompagnements(
          produits.filter(
            (p) => p.categorie === 'accompagnements' && p.disponible !== false
          )
        );
      })
      .catch(() => {});
  }, []);

  /* ---------- PANIER VIDE ---------- */
  if (items.length === 0) {
    return (
      <div className="max-w-app mx-auto px-4 pt-6">
        <Header titre="Panier" />
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface shadow-card flex items-center justify-center mb-5">
            <ShoppingCart size={36} strokeWidth={1.5} className="text-ink-light" />
          </div>
          <p className="text-lg font-semibold mb-1">Votre panier est vide</p>
          <p className="text-sm text-ink-light mb-6 max-w-xs">
            Parcourez notre menu et ajoutez vos plats préférés en quelques clics.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-primary text-white px-6 py-3 rounded-md font-semibold"
          >
            Voir le menu
          </button>
        </div>
      </div>
    );
  }

  const nbArticles = items.reduce((s, i) => s + i.quantite, 0);

  const estDansPanier = (produitId) =>
    items.some((i) => i.produitId === produitId);

  const toggleAccompagnement = (accompagnement) => {
    if (estDansPanier(accompagnement.id)) {
      retirer(accompagnement.id);
    } else {
      ajouter(accompagnement);
    }
  };

  const passerCommande = () => {
    navigate('/confirmation');
  };

  return (
    <div className="max-w-app mx-auto px-4 pt-6 pb-8">
      <Header
        titre="Panier"
        sousTitre={`${nbArticles} article${nbArticles > 1 ? 's' : ''} · ${items.length} produit${items.length > 1 ? 's' : ''}`}
      />

      {/* Liste des articles */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.produitId}
            className="bg-surface rounded-lg shadow-card overflow-hidden"
          >
            <div className="flex gap-3 p-3">
              <img
                src={item.photo}
                alt={item.nom}
                className="w-20 h-20 rounded-md object-cover shrink-0"
              />

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {item.nom}
                    </p>
                    <p className="text-xs text-ink-light mt-0.5">
                      {formatPrix(item.prixUnitaire)} / unité
                    </p>
                  </div>
                  <button
                    onClick={() => retirer(item.produitId)}
                    className="text-ink-light hover:text-danger transition-colors p-1 -mt-1 -mr-1"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-surface-alt rounded-full border border-line">
                    <button
                      onClick={() =>
                        modifierQuantite(item.produitId, item.quantite - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-ink active:scale-90 transition-transform"
                      aria-label="Diminuer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-semibold">
                      {item.quantite}
                    </span>
                    <button
                      onClick={() =>
                        modifierQuantite(item.produitId, item.quantite + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-ink active:scale-90 transition-transform"
                      aria-label="Augmenter"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="font-bold text-primary text-sm">
                    {formatPrix(item.prixUnitaire * item.quantite)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accompagnements à cocher */}
      {accompagnements.length > 0 && (
        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-semibold mb-3">
            <UtensilsCrossed size={16} className="text-primary" />
            Ajouter des accompagnements
          </label>

          <div className="space-y-2">
            {accompagnements.map((a) => {
              const coche = estDansPanier(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    coche
                      ? 'border-primary bg-red-50'
                      : 'border-line bg-surface'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={coche}
                    onChange={() => toggleAccompagnement(a)}
                    className="w-4 h-4 accent-primary"
                  />
                  <img
                    src={a.photo}
                    alt={a.nom}
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.nom}</p>
                    <p className="text-xs text-ink-light truncate">
                      {a.description}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">
                    {formatPrix(a.prix)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Récapitulatif — CORRIGÉ */}
      <div className="mt-6 bg-surface rounded-lg shadow-card p-4">
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-ink-light">
            Sous-total ({nbArticles} article{nbArticles > 1 ? 's' : ''})
          </span>
          <span className="font-semibold">{formatPrix(total)}</span>
        </div>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-ink-light">Livraison</span>
          <span className="text-ink-light italic text-xs">
            Calculée à l'étape suivante selon votre zone
          </span>
        </div>
        <div className="border-t border-line mt-2 pt-3 flex justify-between items-baseline">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">
            {formatPrix(total)}
          </span>
        </div>
        <p className="text-[11px] text-ink-light mt-1">
          Hors frais de livraison. Le total final (avec livraison) sera affiché
          à l'étape de confirmation.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <button
          onClick={vider}
          className="px-4 py-3 rounded-md border border-line text-sm text-ink-light hover:text-danger hover:border-danger transition-colors"
        >
          Vider
        </button>
        <button
          onClick={passerCommande}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          Passer la commande
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}