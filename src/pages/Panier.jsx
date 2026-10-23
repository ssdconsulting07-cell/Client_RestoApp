import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ChefHat,
  ShoppingBag,
  MessageSquareText,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { formatPrix } from '../utils/format';
import Header from '../components/Header';

const FRAIS_LIVRAISON = 1000;

export default function Panier() {
  const navigate = useNavigate();
  const { items, modifierQuantite, retirer, total, vider } = useCart();
  const [note, setNote] = useState('');

  const sousTotal = total;
  const totalCommande = sousTotal + FRAIS_LIVRAISON;
  const nombreArticles = items.reduce(
    (somme, item) => somme + item.quantite,
    0
  );

  const passerCommande = () => {
    sessionStorage.setItem('senyummies_note', note);
    navigate('/confirmation');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F3]">
        <div className="max-w-app mx-auto px-4 pt-6">
          <Header titre="Mon panier" />

          <div className="flex flex-col items-center text-center py-20">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <ShoppingCart
                size={42}
                strokeWidth={1.5}
                className="text-orange-600"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Votre panier est vide
            </h2>

            <p className="text-sm text-gray-500 max-w-xs leading-6 mb-7">
              Une petite faim ? Découvrez nos délicieux produits et
              composez votre prochaine commande.
            </p>

            <button
              onClick={() => navigate('/menu')}
              className="bg-orange-600 hover:bg-orange-700 text-white
                px-7 py-3.5 rounded-2xl font-semibold shadow-lg
                shadow-orange-200 transition-all active:scale-95
                flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Découvrir le menu
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F3]">
      <div className="max-w-app mx-auto px-4 pt-6 pb-32">
        <Header
          titre="Mon panier"
          sousTitre={`${nombreArticles} article${nombreArticles > 1 ? 's' : ''} sélectionné${nombreArticles > 1 ? 's' : ''}`}
        />

        {/* Bandeau */}
        <div className="mt-5 mb-6 rounded-2xl bg-gradient-to-r
          from-orange-600 to-orange-500 p-4 text-white shadow-lg
          shadow-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20
              flex items-center justify-center">
              <ChefHat size={25} />
            </div>

            <div className="flex-1">
              <p className="font-bold text-base">
                Votre sélection gourmande
              </p>
            </div>

            <span className="bg-white text-orange-700 rounded-full
              min-w-9 h-9 px-2 flex items-center justify-center
              text-sm font-bold">
              {nombreArticles}
            </span>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Vos articles
          </h2>

          <button
            onClick={vider}
            className="text-xs font-medium text-red-500
              hover:text-red-700 transition-colors"
          >
            Tout supprimer
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.produitId}
              className="bg-white rounded-2xl p-3
                border border-orange-100/70 shadow-sm
                transition-all hover:shadow-md"
            >
              <div className="flex gap-3">
                <div className="w-24 h-24 shrink-0 rounded-xl
                  overflow-hidden bg-orange-50">
                  <img
                    src={item.photo}
                    alt={item.nom}
                    className="w-full h-full object-cover
                      transition-transform duration-300
                      hover:scale-105"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm
                      leading-5">
                      {item.nom}
                    </h3>

                    <button
                      onClick={() => retirer(item.produitId)}
                      aria-label={`Supprimer ${item.nom}`}
                      className="shrink-0 w-8 h-8 rounded-full
                        flex items-center justify-center
                        bg-red-50 text-red-400
                        hover:bg-red-100 hover:text-red-600
                        transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {formatPrix(item.prixUnitaire)} / unité
                  </p>

                  <div className="flex items-center justify-between
                    gap-2 mt-auto pt-3">
                    <div className="flex items-center gap-3
                      bg-[#FFF7EF] rounded-full p-1">
                      <button
                        onClick={() =>
                          modifierQuantite(
                            item.produitId,
                            item.quantite - 1
                          )
                        }
                        aria-label="Diminuer la quantité"
                        className="w-7 h-7 rounded-full bg-white
                          shadow-sm flex items-center justify-center
                          text-gray-700 hover:text-orange-600
                          transition-colors"
                      >
                        <Minus size={13} />
                      </button>

                      <span className="min-w-4 text-center
                        text-sm font-bold text-gray-900">
                        {item.quantite}
                      </span>

                      <button
                        onClick={() =>
                          modifierQuantite(
                            item.produitId,
                            item.quantite + 1
                          )
                        }
                        aria-label="Augmenter la quantité"
                        className="w-7 h-7 rounded-full
                          bg-orange-600 text-white shadow-sm
                          flex items-center justify-center
                          hover:bg-orange-700 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="font-extrabold text-orange-700
                      text-sm whitespace-nowrap">
                      {formatPrix(item.prixUnitaire * item.quantite)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Note cuisine */}
        <section className="mt-6 bg-white rounded-2xl p-4
          border border-orange-100/70 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100
              flex items-center justify-center text-orange-600">
              <MessageSquareText size={18} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                Une précision pour le chef ?
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Facultatif
              </p>
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. : sans oignon, bien cuit..."
            rows={3}
            className="w-full p-3 rounded-xl bg-[#FFF9F3]
              border border-orange-100 text-sm text-gray-800
              placeholder:text-gray-400 resize-none
              focus:outline-none focus:ring-2
              focus:ring-orange-200 focus:border-orange-400
              transition-all"
          />
        </section>

        {/* Récapitulatif */}
        <section className="mt-6 bg-white rounded-2xl p-5
          border border-orange-100/70 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Récapitulatif
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-semibold text-gray-900">
                {formatPrix(sousTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500 flex items-center gap-2">
                <Truck size={16} />
                Livraison
              </span>
              <span className="font-semibold text-gray-900">
                {formatPrix(FRAIS_LIVRAISON)}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed
            border-orange-200 my-4" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">Total à payer</p>
              <p className="text-xs text-gray-400 mt-1">
                Livraison incluse
              </p>
            </div>

            <span className="text-xl font-extrabold text-orange-700">
              {formatPrix(totalCommande)}
            </span>
          </div>
        </section>

        {/* Réassurance */}
        <div className="flex items-center justify-center gap-2
          mt-5 text-xs text-gray-500">
          <ShieldCheck size={16} className="text-green-600" />
          <span>Vérifiez votre commande avant confirmation</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={vider}
            className="px-4 py-3.5 rounded-xl
              border border-orange-200 bg-white
              text-gray-600 font-semibold text-sm
              hover:bg-orange-50 transition-colors"
          >
            Vider
          </button>

          <button
            onClick={passerCommande}
            className="flex-1 bg-orange-600 hover:bg-orange-700
              text-white font-bold py-3.5 px-4 rounded-xl
              flex items-center justify-center gap-2
              shadow-lg shadow-orange-200
              transition-all active:scale-[0.98]"
          >
            Commander
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}