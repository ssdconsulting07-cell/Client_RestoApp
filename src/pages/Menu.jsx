import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, PackageOpen, SlidersHorizontal, ArrowRight, UtensilsCrossed } from 'lucide-react';

import { useCatalogue } from '../context/CatalogueContext';
import useAjoutPanier from '../hooks/useAjoutPanier';
import { IconeCategorie } from '../utils/categories';
import Header from '../components/Header';
import ProduitCarte from '../components/ProduitCarte';
import SectionPlatsDuJour from '../components/SectionPlatsDuJour';
import { Squelette, SqueletteGrille, SqueletteCategories, EtatErreur } from '../components/EtatChargement';

// Recherche insensible a la casse ET aux accents ("pate" trouve "Pâtes").
const normaliser = (s) =>
  String(s || '')
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function Menu() {
  const { categories, produits, chargement, erreur, recharger, categorieNom } = useCatalogue();
  const { ajouterProduit, ajouterPlatDuJour } = useAjoutPanier();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recherche, setRecherche] = useState(searchParams.get('q') || '');

  const categorieUrl = searchParams.get('categorie') || 'tout';
  const categorieActive = categories.some((c) => c.id === categorieUrl) ? categorieUrl : 'tout';

  const produitsFiltres = useMemo(() => {
    let liste = produits;
    if (categorieActive !== 'tout') liste = liste.filter((p) => p.categorieId === categorieActive);
    const q = normaliser(recherche.trim());
    if (q) liste = liste.filter((p) => normaliser(`${p.nom} ${p.description}`).includes(q));
    return liste;
  }, [produits, categorieActive, recherche]);

  const majParams = (modifier) => {
    const params = new URLSearchParams(searchParams);
    modifier(params);
    setSearchParams(params, { replace: true });
  };

  const handleCategorie = (id) =>
    majParams((p) => (id === 'tout' ? p.delete('categorie') : p.set('categorie', id)));

  const handleRecherche = (valeur) => {
    setRecherche(valeur);
    majParams((p) => (valeur.trim() ? p.set('q', valeur.trim()) : p.delete('q')));
  };

  const resetTout = () => {
    setRecherche('');
    setSearchParams({}, { replace: true });
  };

  const onglets = [{ id: 'tout', nom: 'Tout' }, ...categories];

  return (
    <main className="overflow-x-hidden bg-surface-alt text-ink">
      <div className="mx-auto max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:pt-8">
        <Header titre="Notre menu" sousTitre="Choisissez vos plats préférés" />
      </div>

      <div className="mx-auto mt-2 max-w-6xl">
        <SectionPlatsDuJour onAjouter={ajouterPlatDuJour} />
      </div>

      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <UtensilsCrossed size={21} className="text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold sm:text-3xl">Tout le menu</h2>
        </div>

        {/* Recherche */}
        <label htmlFor="recherche-menu" className="sr-only">Rechercher un produit</label>
        <div className="flex min-h-[50px] items-center gap-3 rounded-2xl md:max-w-xl border border-line bg-surface px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
          <Search size={20} className="shrink-0 text-primary" aria-hidden="true" />
          <input
            id="recherche-menu"
            type="search"
            enterKeyHint="search"
            value={recherche}
            onChange={(e) => handleRecherche(e.target.value)}
            placeholder="Un plat, une boisson…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-ink-light"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => handleRecherche('')}
              aria-label="Effacer la recherche"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line/70 text-ink-light"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Catégories */}
        <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {chargement && categories.length === 0 ? (
            <SqueletteCategories variante="puces" />
          ) : (
          <div className="flex w-max gap-2 md:w-auto md:flex-wrap" role="group" aria-label="Filtrer par catégorie">
            {onglets.map((c) => {
              const actif = categorieActive === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategorie(c.id)}
                  aria-pressed={actif}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold transition active:scale-[0.97] ${
                    actif ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink'
                  }`}
                >
                  {c.id === 'tout' ? <SlidersHorizontal size={15} aria-hidden="true" /> : <IconeCategorie nom={c.nom} size={15} />}
                  {c.nom}
                </button>
              );
            })}
          </div>
          )}
        </div>

        <div className="mb-4 mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {recherche.trim()
                ? 'Résultats de recherche'
                : categorieActive === 'tout'
                  ? 'Tous nos produits'
                  : categorieNom(categorieActive)}
            </p>
            {chargement && produits.length === 0 ? (
              <Squelette className="mt-1.5 h-3 w-16 rounded" />
            ) : (
              <p className="mt-0.5 text-xs text-ink-light">
                {produitsFiltres.length} produit{produitsFiltres.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {(categorieActive !== 'tout' || recherche) && (
            <button
              type="button"
              onClick={resetTout}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-primary"
            >
              <X size={14} aria-hidden="true" /> Effacer
            </button>
          )}
        </div>

        {chargement && produits.length === 0 ? (
          <SqueletteGrille nb={6} />
        ) : erreur && produits.length === 0 ? (
          <EtatErreur message={erreur} onReessayer={recharger} />
        ) : produitsFiltres.length === 0 ? (
          <EtatVide recherche={recherche} onReset={resetTout} />
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {produitsFiltres.map((p) => (
              <ProduitCarte
                key={p.id}
                produit={p}
                categorieNom={categorieActive === 'tout' ? categorieNom(p.categorieId) : undefined}
                onAjouter={ajouterProduit}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EtatVide({ recherche, onReset }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {recherche ? <Search size={28} aria-hidden="true" /> : <PackageOpen size={28} aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-bold">{recherche ? 'Aucun résultat' : 'Aucun produit dans cette catégorie'}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-ink-light">
        {recherche
          ? 'Essayez un autre mot ou vérifiez l’orthographe.'
          : 'Les produits apparaîtront ici dès qu’ils seront publiés.'}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white active:scale-[0.98]"
      >
        Voir tout le menu <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
