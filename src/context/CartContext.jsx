import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'senyummies_panier';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const ajouter = (produit, quantite = 1, personnalisations = []) => {
    const extras = personnalisations.reduce((s, p) => s + (p.prix || 0), 0);
    const key = `${produit.id}-${personnalisations.map((p) => p.id).sort().join('-')}`;
    setItems((prev) => {
      const existant = prev.find((i) => i.key === key);
      if (existant) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantite: i.quantite + quantite } : i
        );
      }
      return [
        ...prev,
        {
          key,
          produitId: produit.id,
          nom: produit.nom,
          photo: produit.photo,
          prixUnitaire: produit.prix + extras,
          quantite,
          personnalisations,
        },
      ];
    });
  };

  const retirer = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const modifierQuantite = (key, quantite) => {
    if (quantite <= 0) return retirer(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantite } : i)));
  };

  const vider = () => setItems([]);

  const total = items.reduce((s, i) => s + i.prixUnitaire * i.quantite, 0);
  const nbArticles = items.reduce((s, i) => s + i.quantite, 0);

  return (
    <CartContext.Provider
      value={{ items, ajouter, retirer, modifierQuantite, vider, total, nbArticles }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
};