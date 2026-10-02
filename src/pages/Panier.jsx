import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrix } from '../utils/format';

export default function Panier() {
  const navigate = useNavigate();
  const { items, modifierQuantite, retirer, total, vider } = useCart();
  const [note, setNote] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-app mx-auto px-4 py-20 flex flex-col items-center text-center">
        <ShoppingCart size={48} strokeWidth={1.5} className="text-ink-light mb-4" />
        <p className="text-lg font-semibold mb-1">Votre panier est vide</p>
        <p className="text-sm text-ink-light mb-6">
          Ajoutez des produits depuis le menu.
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-primary text-white px-6 py-3 rounded-md font-semibold"
        >
          Voir le menu
        </button>
      </div>
    );
  }

  const passerCommande = () => {
    sessionStorage.setItem('senyummies_note', note);
    navigate('/confirmation');
  };

  return (
    <div className="max-w-app mx-auto px-4 pt-6 pb-8">
      <h1 className="text-2xl font-semibold mb-4">Mon panier</h1>

      {/* Liste articles */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.produitId}
            className="bg-surface rounded-md shadow-card p-3 flex gap-3"
          >
            <img
              src={item.photo}
              alt={item.nom}
              className="w-20 h-20 rounded-md object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-sm truncate">{item.nom}</p>
                <button
                  onClick={() => retirer(item.produitId)}
                  className="text-ink-light hover:text-danger"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-xs text-ink-light mt-0.5">
                {formatPrix(item.prixUnitaire)}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => modifierQuantite(item.produitId, item.quantite - 1)}
                    className="w-7 h-7 rounded-full border border-line flex items-center justify-center"
                    aria-label="Diminuer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="min-w-[20px] text-center text-sm font-semibold">
                    {item.quantite}
                  </span>
                  <button
                    onClick={() => modifierQuantite(item.produitId, item.quantite + 1)}
                    className="w-7 h-7 rounded-full border border-line flex items-center justify-center"
                    aria-label="Augmenter"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="font-bold text-primary text-sm">
                  {formatPrix(item.prixUnitaire * item.quantite)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note pour la cuisine */}
      <div className="mt-5">
        <label className="text-xs text-ink-light block mb-1.5">
          Note pour la cuisine (facultatif)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex : sans oignon, bien cuit…"
          rows={3}
          className="w-full p-3 rounded-md border border-line text-sm resize-none focus:outline-none focus:border-primary"
        />
      </div>

      {/* Total */}
      <div className="mt-5 bg-surface rounded-md shadow-card p-4">
        <div className="flex justify-between text-sm py-1">
          <span className="text-ink-light">Sous-total</span>
          <span className="font-semibold">{formatPrix(total)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-ink-light">Livraison (si applicable)</span>
          <span className="text-ink-light">+{formatPrix(1000)}</span>
        </div>
        <div className="border-t border-line mt-2 pt-2 flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-primary">{formatPrix(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <button
          onClick={vider}
          className="px-4 py-3 rounded-md border border-line text-sm"
        >
          Vider
        </button>
        <button
          onClick={passerCommande}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2"
        >
          Passer la commande
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}