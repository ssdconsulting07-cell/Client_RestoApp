import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  getProduits,
  getPlatsDuJour,
  getAccompagnementsCondiments,
  getHorairesServices,
} from '../api/catalogue';
import { ecouterChangements } from '../api/tempsReel';

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
    horaires: [],
  });
  // Heure courante, rafraichie chaque minute : un plat du jour devient
  // commandable (ou repasse en lecture seule) a l'ouverture / la fin du service.
  const [maintenant, setMaintenant] = useState(() => new Date());

  const charger = useCallback(async () => {
    setEtat((e) => ({ ...e, chargement: true, erreur: null }));
    try {
      const [categories, produits, platsDuJour, accompagnements, horaires] = await Promise.all([
        getCategories(),
        getProduits(),
        getPlatsDuJour(),
        getAccompagnementsCondiments(),
        getHorairesServices(),
      ]);
      setEtat({ chargement: false, erreur: null, categories, produits, platsDuJour, accompagnements, horaires });
    } catch (err) {
      setEtat((e) => ({ ...e, chargement: false, erreur: err.message }));
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Temps reel : rechargement silencieux du seul sujet modifie par le
  // Gerant (pas d'ecran de chargement, le client continue de naviguer).
  useEffect(() => {
    const silencieux = (fn) => async () => {
      try {
        const maj = await fn();
        setEtat((e) => ({ ...e, ...maj }));
      } catch {
        // la prochaine notification ou le retour sur l'app rattrapera
      }
    };
    const arrets = [
      ecouterChangements(
        'catalogue',
        silencieux(async () => {
          const [categories, produits, accompagnements] = await Promise.all([
            getCategories(),
            getProduits(),
            getAccompagnementsCondiments(),
          ]);
          return { categories, produits, accompagnements };
        })
      ),
      ecouterChangements('plats-du-jour', silencieux(async () => ({ platsDuJour: await getPlatsDuJour() }))),
      ecouterChangements('horaires', silencieux(async () => ({ horaires: await getHorairesServices() }))),
    ];
    const minute = setInterval(() => setMaintenant(new Date()), 60_000);
    return () => {
      arrets.forEach((a) => a());
      clearInterval(minute);
    };
  }, []);

  const valeur = useMemo(() => {
    const categoriesActives = new Set(etat.categories.map((c) => c.id));
    // Un produit ACTIF dans une categorie non publiee (brouillon/archivee)
    // n'apparait pas cote client — meme regle que l'apercu client du Gerant
    // (CategoryPreviewModal.jsx).
    const produitsVisibles = etat.produits.filter((p) => categoriesActives.has(p.categorieId));
    const categoriesAvecProduits = etat.categories.filter((c) =>
      produitsVisibles.some((p) => p.categorieId === c.id)
    );
    // Le backend indique par categorie si un accompagnement est propose
    // (accompagnementPropose). Repli sur le nom "Burgers" pour les donnees qui
    // n'ont pas encore ce champ (mock de demonstration).
    const avecAccompagnement = new Set(
      etat.categories
        .filter((c) =>
          typeof c.accompagnementPropose === 'boolean'
            ? c.accompagnementPropose
            : String(c.nom || '').toLowerCase() === 'burgers'
        )
        .map((c) => c.id)
    );
    return {
      ...etat,
      maintenant,
      produits: produitsVisibles,
      categories: categoriesAvecProduits,
      categorieNom: (id) => etat.categories.find((c) => c.id === id)?.nom || '',
      // Accompagnement facture en plus du prix du produit, pour les
      // categories qui le proposent.
      accompagnementEligible: (produit) => avecAccompagnement.has(produit.categorieId),
      recharger: charger,
    };
  }, [etat, charger, maintenant]);

  return <CatalogueContext.Provider value={valeur}>{children}</CatalogueContext.Provider>;
}

export const useCatalogue = () => {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error('useCatalogue doit être utilisé dans CatalogueProvider');
  return ctx;
};
