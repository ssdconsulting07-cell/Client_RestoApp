import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Panier — meme logique de lignes que la caisse du Vendeur
// (Manager_RestoApp, Vente.jsx) pour que la Cuisine recoive exactement le
// meme format quel que soit le canal :
//   - une ligne = un produit (ou plat du jour) + un accompagnement eventuel ;
//   - un produit sans accompagnement se fusionne avec la ligne existante ;
//   - choisir un accompagnement sur une ligne de quantite > 1 en detache une
//     unite (deux burgers peuvent avoir deux accompagnements differents) ;
//   - prix unitaire = prix du produit + prix de l'accompagnement.
// Cle de stockage versionnee : l'ancien format (items sans ligneId) est
// ignore plutot que de produire un panier incoherent.
const CartContext = createContext(null);
const STORAGE_KEY = 'senyummies_panier_v2';

let compteur = 0;
const nouvelleLigneId = () => `l-${Date.now().toString(36)}-${(compteur++).toString(36)}`;

function lireStockage() {
  try {
    const brut = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(brut) ? brut.filter((l) => l && l.ligneId && l.produitId) : [];
  } catch {
    return [];
  }
}

export const prixUnitaireLigne = (l) => Number(l.prixBase || 0) + Number(l.accompagnementPrix || 0);

export function CartProvider({ children }) {
  const [lignes, setLignes] = useState(lireStockage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lignes));
    } catch {
      // Stockage indisponible (navigation privee) : le panier reste en memoire.
    }
  }, [lignes]);

  const ajouter = useCallback((produit, { type = 'PRODUIT', accompagnementEligible = false } = {}) => {
    setLignes((courant) => {
      const existante = courant.find(
        (l) => l.produitId === produit.id && l.type === type && !l.accompagnementId
      );
      if (existante) {
        return courant.map((l) =>
          l.ligneId === existante.ligneId ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [
        ...courant,
        {
          ligneId: nouvelleLigneId(),
          type,
          produitId: produit.id,
          nom: produit.nom,
          photoUrl: produit.photoUrl || null,
          prixBase: produit.prix,
          accompagnementEligible,
          accompagnementId: null,
          accompagnementNom: null,
          accompagnementPrix: 0,
          quantite: 1,
        },
      ];
    });
  }, []);

  const changerQuantite = useCallback((ligneId, delta) => {
    setLignes((courant) =>
      courant
        .map((l) => (l.ligneId === ligneId ? { ...l, quantite: l.quantite + delta } : l))
        .filter((l) => l.quantite > 0)
    );
  }, []);

  const retirer = useCallback((ligneId) => {
    setLignes((courant) => courant.filter((l) => l.ligneId !== ligneId));
  }, []);

  const choisirAccompagnement = useCallback((ligneId, accompagnement) => {
    setLignes((courant) => {
      const ligne = courant.find((l) => l.ligneId === ligneId);
      if (!ligne) return courant;
      const appliquer = (l) =>
        accompagnement
          ? {
              ...l,
              accompagnementId: accompagnement.id,
              accompagnementNom: accompagnement.nom,
              accompagnementPrix: accompagnement.prix,
            }
          : { ...l, accompagnementId: null, accompagnementNom: null, accompagnementPrix: 0 };
      if (ligne.quantite <= 1) {
        return courant.map((l) => (l.ligneId === ligneId ? appliquer(l) : l));
      }
      const detachee = appliquer({ ...ligne, ligneId: nouvelleLigneId(), quantite: 1 });
      return courant
        .map((l) => (l.ligneId === ligneId ? { ...l, quantite: l.quantite - 1 } : l))
        .concat(detachee);
    });
  }, []);

  // Recale le panier sur le catalogue actuellement publie : prix/nom/photo a
  // jour, accompagnement retire s'il n'est plus propose. Les lignes dont le
  // produit n'est plus vendable sont marquees (pas supprimees en silence) :
  // le Panier les signale et bloque la commande tant qu'elles y sont.
  const actualiser = useCallback((trouverFiche, trouverAccompagnement) => {
    setLignes((courant) => {
      let change = false;
      const suivant = courant.map((l) => {
        const fiche = trouverFiche(l);
        const indisponible = !fiche || fiche.disponibilite === 'RUPTURE';
        let maj = { ...l, indisponible };
        if (fiche) {
          maj = { ...maj, nom: fiche.nom, prixBase: fiche.prix, photoUrl: fiche.photoUrl || null };
        }
        if (l.accompagnementId) {
          const acc = trouverAccompagnement(l.accompagnementId);
          maj = acc
            ? { ...maj, accompagnementNom: acc.nom, accompagnementPrix: acc.prix }
            : { ...maj, accompagnementId: null, accompagnementNom: null, accompagnementPrix: 0 };
        }
        if (JSON.stringify(maj) !== JSON.stringify(l)) change = true;
        return maj;
      });
      return change ? suivant : courant;
    });
  }, []);

  const vider = useCallback(() => setLignes([]), []);

  const valeur = useMemo(() => {
    const total = lignes.reduce((s, l) => s + prixUnitaireLigne(l) * l.quantite, 0);
    const nbArticles = lignes.reduce((s, l) => s + l.quantite, 0);
    return {
      lignes,
      ajouter,
      changerQuantite,
      retirer,
      choisirAccompagnement,
      actualiser,
      vider,
      total,
      nbArticles,
    };
  }, [lignes, ajouter, changerQuantite, retirer, choisirAccompagnement, actualiser, vider]);

  return <CartContext.Provider value={valeur}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
};
