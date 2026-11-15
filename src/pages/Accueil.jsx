import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';

import { useCatalogue } from '../context/CatalogueContext';
import useAjoutPanier from '../hooks/useAjoutPanier';
import { IconeCategorie } from '../utils/categories';
import BoutonNotif from '../components/BoutonNotif';
import ProduitCarte from '../components/ProduitCarte';
import SectionPlatsDuJour from '../components/SectionPlatsDuJour';
import { SqueletteRangees, SqueletteCategories, EtatErreur } from '../components/EtatChargement';
import { Monogramme, NomMarque } from '../components/Marque';
import { marque, sloganEnDeuxLignes } from '../config/marque';

const slogan = sloganEnDeuxLignes();

export default function Accueil() {
  const { categories, produits, chargement, erreur, recharger } = useCatalogue();
  const { ajouterProduit, ajouterPlatDuJour } = useAjoutPanier();

  return (
    <main className="overflow-x-hidden bg-surface-alt text-ink">
      {/* En-tête : meme identite que le back-office (monogramme ou logo, nom de la marque) */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:hidden">
        <Link to="/" aria-label={`${marque.nom} — accueil`} className="flex min-w-0 items-center gap-3">
          <Monogramme className="h-11 w-11 rounded-2xl text-lg shadow-md" />
          <span className="min-w-0">
            <NomMarque className="block truncate text-lg font-bold leading-tight tracking-tight" />
            <span className="mt-0.5 block truncate text-[11px] text-ink-light">{marque.sousTitre}</span>
          </span>
        </Link>
        <BoutonNotif />
      </header>

      {/* Bannière */}
      <section className="mx-auto max-w-6xl px-4 pt-2 sm:px-6 md:pt-6">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-ink">
          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80"
            alt=""
            // React 18 ne connait pas fetchPriority : l'attribut HTML en minuscules passe tel quel.
            // eslint-disable-next-line react/no-unknown-property
            fetchpriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/10 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/55 sm:to-transparent" />
          <div className="flex min-h-[340px] flex-col justify-end p-5 text-white sm:min-h-[400px] sm:p-9 lg:min-h-[460px] lg:p-14">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
              <Sparkles size={14} aria-hidden="true" /> Sans compte · Paiement mobile
            </span>
            <h1 className="max-w-xl text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              {slogan.ligne1}
              {slogan.ligne2 && <span className="mt-1 block text-primary-light">{slogan.ligne2}</span>}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
              Commandez en quelques secondes, en livraison ou à retirer au comptoir.
            </p>
            <Link
              to="/menu"
              className="mt-6 flex min-h-[52px] w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/30 transition active:scale-[0.97]"
            >
              <ShoppingBag size={20} aria-hidden="true" /> Commander maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories publiées */}
      {chargement && categories.length === 0 && (
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <h2 className="mb-4 text-lg font-bold sm:text-xl">Qu'est-ce qui vous tente ?</h2>
          <SqueletteCategories />
        </section>
      )}
      {categories.length > 0 && (
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold sm:text-xl">Qu'est-ce qui vous tente ?</h2>
              <p className="mt-1 text-xs text-ink-light">Retrouvez vos envies en un clic.</p>
            </div>
            <Link
              to="/menu"
              className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 text-xs font-bold text-primary"
            >
              Tout voir <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2 pb-1 sm:gap-3 md:grid md:w-full md:grid-cols-4 lg:grid-cols-6">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/menu?categorie=${encodeURIComponent(c.id)}`}
                  className="flex w-[84px] flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-1 py-3 transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] sm:w-28 md:w-auto md:py-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <IconeCategorie nom={c.nom} size={21} />
                  </span>
                  <span className="w-full truncate px-1 text-center text-[11px] font-semibold sm:text-xs">{c.nom}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Plats du jour */}
      <div className="mx-auto mt-8 max-w-6xl">
        <SectionPlatsDuJour onAjouter={ajouterPlatDuJour} />
      </div>

      {/* Une rangée par catégorie publiée */}
      <section className="mx-auto mt-8 max-w-6xl pb-6">
        {chargement && produits.length === 0 ? (
          <SqueletteRangees nb={2} />
        ) : erreur && produits.length === 0 ? (
          <div className="px-4 sm:px-6">
            <EtatErreur message={erreur} onReessayer={recharger} />
          </div>
        ) : (
          categories.map((c) => {
            const liste = produits.filter((p) => p.categorieId === c.id);
            return (
              <div key={c.id} className="mb-8">
                <div className="mb-3 flex items-center justify-between gap-3 px-4 sm:px-6">
                  <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold">
                    <span className="shrink-0 text-primary"><IconeCategorie nom={c.nom} size={18} /></span>
                    <span className="truncate">{c.nom}</span>
                  </h2>
                  <Link
                    to={`/menu?categorie=${encodeURIComponent(c.id)}`}
                    className="-mr-2 inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-primary"
                  >
                    Voir tout <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <div className="overflow-x-auto [scroll-snap-type:x_mandatory] [scrollbar-width:none] md:overflow-visible [&::-webkit-scrollbar]:hidden">
                  <div className="flex w-max gap-3 px-4 pb-2 sm:px-6 md:grid md:w-full md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                    {liste.map((p) => (
                      <div key={p.id} className="w-[46vw] max-w-[220px] [scroll-snap-align:start] md:w-auto md:max-w-none">
                        <ProduitCarte produit={p} onAjouter={ajouterProduit} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
