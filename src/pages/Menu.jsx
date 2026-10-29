import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Search,
  X,
  Flame,
  Cake,
  UtensilsCrossed,
  CupSoda,
  PackageOpen,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Salad,
  Droplets,
} from 'lucide-react';

import { produits } from '../data/produits';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import ProduitCarte from '../components/ProduitCarte';
import SectionPlatsDuJour from '../components/SectionPlatsDuJour';

// Categories alignees sur db.json (categorie des produits reels cote API) —
// avant ce fix, 'plats' n'existait dans aucun produit reel (categorie
// 'burgers'), et 'accompagnements'/'condiments' n'avaient aucun filtre.
const CATEGORIES = [
  { id: 'tout', label: 'Tout', Icone: SlidersHorizontal },
  { id: 'burgers', label: 'Burgers', Icone: UtensilsCrossed },
  { id: 'accompagnements', label: 'Accompagnements', Icone: Salad },
  { id: 'condiments', label: 'Condiments', Icone: Droplets },
  { id: 'boissons', label: 'Boissons', Icone: CupSoda },
  { id: 'desserts', label: 'Desserts', Icone: Cake },
];

export default function Menu() {
  const { ajouter } = useCart();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const categorieUrl = searchParams.get('categorie') || 'tout';
  const rechercheUrl = searchParams.get('q') || '';

  const categorieActive =
    categorieUrl === 'plats-du-jour' ||
    !CATEGORIES.some((categorie) => categorie.id === categorieUrl)
      ? 'tout'
      : categorieUrl;

  const [recherche, setRecherche] = useState(rechercheUrl);

  const produitsHorsPlatsDuJour = useMemo(
    () => produits.filter((produit) => produit.categorie !== 'plats-du-jour'),
    []
  );

  const produitsFiltres = useMemo(() => {
    let liste = produitsHorsPlatsDuJour;

    if (categorieActive !== 'tout') {
      liste = liste.filter((produit) => produit.categorie === categorieActive);
    }

    const q = recherche.trim().toLocaleLowerCase('fr');

    if (q) {
      liste = liste.filter((produit) => {
        const nom = (produit.nom || '').toLocaleLowerCase('fr');
        const description = (produit.description || '').toLocaleLowerCase('fr');

        return nom.includes(q) || description.includes(q);
      });
    }

    return liste;
  }, [categorieActive, recherche, produitsHorsPlatsDuJour]);

  const handleCategorie = (id) => {
    const params = new URLSearchParams(searchParams);

    if (id === 'tout') {
      params.delete('categorie');
    } else {
      params.set('categorie', id);
    }

    setSearchParams(params, { replace: true });
  };

  const handleRecherche = (valeur) => {
    setRecherche(valeur);

    const params = new URLSearchParams(searchParams);
    const q = valeur.trim();

    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }

    setSearchParams(params, { replace: true });
  };

  const effacerRecherche = () => handleRecherche('');

  const resetTout = () => {
    setRecherche('');
    setSearchParams({}, { replace: true });
  };

  const handleAjouter = (produit) => {
    if (produit.disponible === false) {
      showToast(produit.nom + " n'est pas disponible");
      return;
    }

    ajouter(produit);
    showToast(produit.nom + ' ajouté au panier');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-alt pb-28 text-ink">
      {/* En-tête */}
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <Header
          titre="Notre menu"
          sousTitre="Choisissez vos plats préférés"
        />
      </div>

      {/* Carte d'introduction compacte */}
      <section className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-4 py-4 text-white sm:px-5 sm:py-5">
          <div className="pointer-events-none absolute -right-5 -top-8 h-24 w-24 rounded-full bg-white/10" />

          <div className="relative">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide">
              <Sparkles size={11} />
              Fait avec gourmandise
            </span>

            <h1 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
              Une envie ?
              <span className="ml-1 text-white/80">
                On a ce qu'il vous faut.
              </span>
            </h1>

            <p className="mt-1 text-xs leading-5 text-white/85 sm:text-sm">
              Découvrez nos plats, boissons et desserts préférés.
            </p>
          </div>
        </div>
      </section>

      {/* Plats du jour */}
      <div className="mx-auto mt-5 max-w-6xl">
        <SectionPlatsDuJour onAjouter={handleAjouter} />
      </div>

      {/* Menu principal */}
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={21} className="text-primary" />
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Tout le menu
            </h2>
          </div>

          <p className="mt-2 text-sm leading-5 text-ink-light">
            Trouvez votre prochain coup de cœur.
          </p>
        </div>

        {/* Recherche */}
        <div className="relative">
          <label htmlFor="recherche-menu" className="sr-only">
            Rechercher un produit
          </label>

          <div className="flex min-h-[50px] items-center gap-3 rounded-2xl border border-line bg-surface px-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
            <Search size={20} className="shrink-0 text-primary" />

            <input
              id="recherche-menu"
              type="search"
              value={recherche}
              onChange={(e) => handleRecherche(e.target.value)}
              placeholder="Un plat, une boisson, un dessert..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-ink-light"
            />

            {recherche && (
              <button
                type="button"
                onClick={effacerRecherche}
                aria-label="Effacer la recherche"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-line/70 text-ink-light transition hover:bg-line"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Catégories */}
        <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2" role="group" aria-label="Filtrer par catégorie">
            {CATEGORIES.map(({ id, label, Icone }) => {
              const actif = categorieActive === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleCategorie(id)}
                  aria-pressed={actif}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition active:scale-[0.97] ${
                    actif
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-line bg-surface text-ink hover:border-primary/40'
                  }`}
                >
                  <Icone size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nombre de produits */}
        <div className="mb-4 mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">
              {recherche.trim()
                ? 'Résultats de recherche'
                : categorieActive === 'tout'
                  ? 'Tous nos produits'
                  : CATEGORIES.find(
                      (categorie) => categorie.id === categorieActive
                    )?.label}
            </p>

            <p className="mt-1 text-xs text-ink-light">
              {produitsFiltres.length}{' '}
              {produitsFiltres.length > 1
                ? 'produits dans la liste'
                : 'produit dans la liste'}
            </p>
          </div>

          {(categorieActive !== 'tout' || recherche) && (
            <button
              type="button"
              onClick={resetTout}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-2 text-xs font-bold text-primary transition hover:bg-primary/5"
            >
              <X size={14} />
              Effacer
            </button>
          )}
        </div>

        {/* Résultats */}
        {produitsFiltres.length === 0 ? (
          <EtatVide recherche={recherche} onReset={resetTout} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {produitsFiltres.map((produit) => (
              <ProduitCarte
                key={produit.id}
                produit={produit}
                onAjouter={handleAjouter}
              />
            ))}
          </div>
        )}

        {/* Message en bas */}
        {produitsFiltres.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-4 text-center">
            <Flame size={17} className="shrink-0 text-primary" />
            <p className="text-xs leading-5 text-ink-light">
              Une petite faim ? Ajoutez vos favoris au panier !
            </p>
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
        {recherche ? <Search size={28} /> : <PackageOpen size={28} />}
      </div>

      <h3 className="text-lg font-bold">
        {recherche
          ? 'Aucun résultat trouvé'
          : 'Aucun produit dans cette catégorie'}
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-ink-light">
        {recherche
          ? 'Essaie un autre mot ou vérifie l’orthographe de ta recherche.'
          : 'Les produits de cette catégorie apparaîtront ici lorsqu’ils seront disponibles.'}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
      >
        Voir tout le menu
        <ArrowRight size={16} />
      </button>
    </div>
  );
}