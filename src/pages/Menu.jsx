import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { getProduits } from '../api/menu';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrix } from '../utils/format';

export default function Menu() {
  const [produits, setProduits] = useState([]);
  const { ajouter } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    getProduits().then(setProduits).catch(() => {});
  }, []);

  const handleAjouter = (produit) => {
    ajouter(produit);
    showToast(`${produit.nom} ajouté au panier`);
  };

  return (
    <div className="max-w-app mx-auto px-4 pt-6">
      <h1 className="text-2xl font-semibold mb-4">Menu</h1>

      <div className="grid grid-cols-2 gap-3">
        {produits.map((p) => {
          const dispo = p.disponible !== false;
          return (
            <div
              key={p.id}
              className={`bg-surface rounded-md shadow-card overflow-hidden flex flex-col ${
                !dispo ? 'opacity-50' : ''
              }`}
            >
              <div className="relative h-28 bg-line">
                <img
                  src={p.photo}
                  alt={p.nom}
                  className={`w-full h-full object-cover ${!dispo ? 'grayscale' : ''}`}
                />
                {!dispo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-danger text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                      Rupture
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-semibold text-sm line-clamp-1">{p.nom}</p>
                  <p className="text-xs text-ink-light line-clamp-2 mt-0.5">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary text-sm">
                    {formatPrix(p.prix)}
                  </span>
                  {dispo ? (
                    <button
                      onClick={() => handleAjouter(p)}
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-ink-light italic">
                      Indisponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}