import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Panier — meme logique de lignes que la caisse du Vendeur
// (Manager_RestoApp, Vente.jsx) pour que la Cuisine recoive exactement le
// meme format quel que soit le canal :
//   - une ligne = un produit (ou plat du jour) + ses accompagnements (zero,
//     un ou plusieurs) ;
//   - un produit sans accompagnement se fusionne avec la ligne existante ;
//   - choisir les accompagnements d'une ligne de quantite > 1 en detache une
//     unite (deux burgers peuvent avoir des accompagnements differents) ;
//   - prix unitaire = prix du produit + somme des accompagnements.
// Cle de stockage versionnee : l'ancien format (items sans ligneId) est
// ignore plutot que de produire un panier incoherent.
const CartContext = createContext(null);
const STORAGE_KEY = 'senyummies_panier_v3';
const ANCIENNE_CLE = 'senyummies_panier_v2';

let compteur = 0;
const nouvelleLigneId = () => `l-${Date.now().toString(36)}-${(compteur++).toString(36)}`;

// Ancien panier (un accompagnement au plus) : repris dans le nouveau format.
const versListe = (l) => {
  if (Array.isArray(l.accompagnements)) return l;
  const { accompagnementId, accompagnementNom, accompagnementPrix, ...reste } = l;
  return {
    ...reste,
    accompagnements: accompagnementId
      ? [{ id: accompagnementId, nom: accompagnementNom, prix: Number(accompagnementPrix || 0) }]
      : [],
  };
};

function lireStockage() {
  try {
    const brut = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(ANCIENNE_CLE));
    return Array.isArray(brut) ? brut.filter((l) => l && l.ligneId && l.produitId).map(versListe) : [];
  } catch {
    return [];
  }
}

export const prixAccompagnements = (l) => (l.accompagnements || []).reduce((s, a) => s + Number(a.prix || 0), 0);
export const prixUnitaireLigne = (l) => Number(l.prixBase || 0) + prixAccompagnements(l);
/** « Frites, Alloco » */
export const nomsAccompagnements = (l) => (l.accompagnements || []).map((a) => a.nom).join(', ');

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
        (l) => l.produitId === produit.id && l.type === type && !(l.accompagnements || []).length
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
          accompagnements: [],
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

  // Remplace les accompagnements d'une unite de la ligne (liste vide = sans).
  const choisirAccompagnements = useCallback((ligneId, choisis) => {
    setLignes((courant) => {
      const ligne = courant.find((l) => l.ligneId === ligneId);
      if (!ligne) return courant;
      const liste = (choisis || []).map((a) => ({ id: a.id, nom: a.nom, prix: Number(a.prix || 0) }));
      const appliquer = (l) => ({ ...l, accompagnements: liste });
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
        if ((l.accompagnements || []).length) {
          maj = {
            ...maj,
            accompagnements: l.accompagnements
              .map((a) => {
                const acc = trouverAccompagnement(a.id);
                return acc ? { id: acc.id, nom: acc.nom, prix: Number(acc.prix || 0) } : null;
              })
              .filter(Boolean),
          };
        }
        if (JSON.stringify(maj) !== JSON.stringify(l)) change = true;
        return maj;
      });
      return change ? suivant : courant;
    });
  }, []);

  const vider = useCallback(() => setLignes([]), []);

  // Remet le panier tel qu'il etait (bouton "Annuler" des toasts).
  const restaurer = useCallback((instantane) => setLignes(instantane), []);

  const valeur = useMemo(() => {
    const total = lignes.reduce((s, l) => s + prixUnitaireLigne(l) * l.quantite, 0);
    const nbArticles = lignes.reduce((s, l) => s + l.quantite, 0);
    return {
      lignes,
      ajouter,
      changerQuantite,
      retirer,
      choisirAccompagnements,
      actualiser,
      vider,
      restaurer,
      total,
      nbArticles,
    };
  }, [lignes, ajouter, changerQuantite, retirer, choisirAccompagnements, actualiser, vider, restaurer]);

  return <CartContext.Provider value={valeur}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
};
