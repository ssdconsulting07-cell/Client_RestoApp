import { useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCatalogue } from '../context/CatalogueContext';

// Ajout au panier partage par Accueil / Menu / Plats du jour.
export default function useAjoutPanier() {
  const { ajouter } = useCart();
  const { showToast } = useToast();
  const { accompagnementEligible } = useCatalogue();

  const ajouterProduit = useCallback(
    (produit) => {
      if (produit.disponibilite === 'RUPTURE') {
        showToast(`${produit.nom} est indisponible`, { type: 'erreur' });
        return;
      }
      ajouter(produit, { type: 'PRODUIT', accompagnementEligible: accompagnementEligible(produit) });
      showToast(`${produit.nom} ajouté au panier`);
    },
    [ajouter, showToast, accompagnementEligible]
  );

  const ajouterPlatDuJour = useCallback(
    (plat) => {
      ajouter(plat, { type: 'PLAT_DU_JOUR', accompagnementEligible: false });
      showToast(`${plat.nom} ajouté au panier`);
    },
    [ajouter, showToast]
  );

  return { ajouterProduit, ajouterPlatDuJour };
}
