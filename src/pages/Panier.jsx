import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrix } from '../utils/format';
import Header from '../components/Header';

export default function Panier() {
  const navigate = useNavigate();
  const { items, modifierQuantite, retirer, total, vider } = useCart();
  const [note, setNote] = useState('');

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

  const passerCommande = () => {
    sessionStorage.setItem('senyummies_note', note);
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
              {/* Image */}
              <img
                src={item.photo}
                alt={item.nom}
                className="w-20 h-20 rounded-md object-cover shrink-0"
              />

              {/* Infos */}
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
                  {/* Sélecteur de quantité */}
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

                  {/* Sous-total ligne */}
                  <span className="font-bold text-primary text-sm">
                    {formatPrix(item.prixUnitaire * item.quantite)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note cuisine */}
      <div className="mt-6">
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <MessageSquare size={16} className="text-primary" />
          Note pour la cuisine
          <span className="text-xs font-normal text-ink-light">(facultatif)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex : sans oignon, bien cuit…"
          rows={3}
          className="w-full p-3 rounded-md border border-line bg-surface text-sm resize-none focus:outline-none focus:border-primary placeholder:text-ink-light"
        />
      </div>

      {/* Récapitulatif */}
      <div className="mt-6 bg-surface rounded-lg shadow-card p-4">
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-ink-light">
            Sous-total ({nbArticles} article{nbArticles > 1 ? 's' : ''})
          </span>
          <span className="font-semibold">{formatPrix(total)}</span>
        </div>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-ink-light">Livraison</span>
          <span className="text-ink-light">+{formatPrix(1000)}</span>
        </div>
        <div className="border-t border-line mt-2 pt-3 flex justify-between items-baseline">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">
            {formatPrix(total)}
          </span>
        </div>
        <p className="text-[11px] text-ink-light mt-1">
          Hors frais de livraison, ajoutés à l'étape suivante.
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