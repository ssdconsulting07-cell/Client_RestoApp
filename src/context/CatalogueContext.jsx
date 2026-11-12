import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  getProduits,
  getPlatsDuJour,
  getAccompagnementsCondiments,
} from '../api/catalogue';

// Catalogue publie par le Gerant, charge une seule fois et partage par
// Accueil, Menu, Panier (au lieu de donnees en dur dans chaque page).
const CatalogueContext = createContext(null);

export function CatalogueProvider({ children }) {
  const [etat, setEtat] = useState({
    chargement: true,
    erreur: null,
    categories: [],
    produits: [],
    platsDuJour: [],
    accompagnements: [],
  });

  const charger = useCallback(async () => {
    setEtat((e) => ({ ...e, chargement: true, erreur: null }));
    try {
      const [categories, produits, platsDuJour, accompagnements] = await Promise.all([
        getCategories(),
        getProduits(),
        getPlatsDuJour(),
        getAccompagnementsCondiments(),
      ]);
      setEtat({ chargement: false, erreur: null, categories, produits, platsDuJour, accompagnements });
    } catch (err) {
      setEtat((e) => ({ ...e, chargement: false, erreur: err.message }));
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const valeur = useMemo(() => {
    const categoriesActives = new Set(etat.categories.map((c) => c.id));
    // Un produit ACTIF dans une categorie non publiee (brouillon/archivee)
    // n'apparait pas cote client — meme regle que l'apercu client du Gerant
    // (CategoryPreviewModal.jsx).
    const produitsVisibles = etat.produits.filter((p) => categoriesActives.has(p.categorieId));
    const categoriesAvecProduits = etat.categories.filter((c) =>
      produitsVisibles.some((p) => p.categorieId === c.id)
    );
    const idBurgers = etat.categories.find((c) => c.nom.toLowerCase() === 'burgers')?.id;
    return {
      ...etat,
      produits: produitsVisibles,
      categories: categoriesAvecProduits,
      categorieNom: (id) => etat.categories.find((c) => c.id === id)?.nom || '',
      // Meme regle que la caisse (Vente.jsx, Manager) : seuls les burgers
      // proposent un accompagnement, facture en plus du prix du produit.
      accompagnementEligible: (produit) => Boolean(idBurgers) && produit.categorieId === idBurgers,
      recharger: charger,
    };
  }, [etat, charger]);

  return <CatalogueContext.Provider value={valeur}>{children}</CatalogueContext.Provider>;
}

export const useCatalogue = () => {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error('useCatalogue doit être utilisé dans CatalogueProvider');
  return ctx;
};
