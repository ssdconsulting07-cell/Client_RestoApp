
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Cake,
  UtensilsCrossed,
  CupSoda,
  Flame,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { produits } from '../data/produits';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import BoutonNotif from '../components/BoutonNotif';
import ProduitCarte from '../components/ProduitCarte';
import SectionPlatsDuJour from '../components/SectionPlatsDuJour';

export default function Accueil() {
  const { ajouter } = useCart();
  const { showToast } = useToast();

  const { nosPlats, nosDesserts, nosBoissons } = useMemo(() => ({
    nosPlats: produits
      .filter((p) => p.categorie === 'burgers')
      .slice(0, 4),

    nosDesserts: produits
      .filter((p) => p.categorie === 'desserts')
      .slice(0, 4),

    nosBoissons: produits
      .filter((p) => p.categorie === 'boissons')
      .slice(0, 4),
  }), []);

  const handleAjouter = (produit) => {
    if (produit.disponible === false) return;

    ajouter(produit);
    showToast(`${produit.nom} ajouté au panier`);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pb-28 text-ink">

      {/* EN-TÊTE */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-3 pt-4 sm:px-6">
        <Link
          to="/"
          aria-label="Retour à l'accueil"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
            <UtensilsCrossed size={22} />
          </div>

          <div>
            <p className="text-lg font-extrabold leading-tight tracking-tight">
              Bon<span className="text-primary">Appétit</span>
            </p>
            <p className="mt-0.5 text-[11px] text-ink-light">
              Le plaisir dans votre assiette
            </p>
          </div>
        </Link>

        <BoutonNotif />
      </header>

      {/* BANNIÈRE PRINCIPALE */}
      <section className="mx-auto max-w-6xl px-3 pt-2 sm:px-6">
        <div className="relative isolate min-h-[420px] overflow-hidden rounded-[28px] bg-neutral-900 sm:min-h-[470px] lg:min-h-[500px]">

          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=85"
            alt="Burger gourmand"
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />

          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/10 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/55 sm:to-transparent" />

          <div className="flex min-h-[420px] flex-col justify-end p-5 text-white sm:min-h-[470px] sm:p-9 lg:min-h-[500px] lg:p-12">

            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-md">
              <Sparkles size={14} />
              Commande en ligne · Dakar
            </div>

            <h1 className="max-w-xl font-serif text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Le goût du bonheur,
              <span className="mt-1 block text-primary">
                à chaque bouchée.
              </span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/85 sm:text-base">
              Burgers gourmands, grillades et sauces maison.
              Choisissez vos envies et régalez-vous !
            </p>

            <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
              <Link
                to="/menu"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.97]"
              >
                <ShoppingBag size={18} />
                Commander
              </Link>

              <Link
                to="/menu"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-3 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.97]"
              >
                Voir le menu
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-white/75">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Découvrez nos spécialités du moment
            </div>
          </div>
        </div>
      </section>

      {/* RACCOURCIS CATÉGORIES */}
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">
              Qu'est-ce qui vous tente ?
            </h2>
            <p className="mt-1 text-xs text-ink-light">
              Retrouvez vos envies en un clic.
            </p>
          </div>

          <Link
            to="/menu"
            aria-label="Voir tout le menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary"
          >
            <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <Categorie
            icon={<UtensilsCrossed size={21} />}
            label="Burgers"
            lien="/menu?categorie=burgers"
          />

          <Categorie
            icon={<CupSoda size={21} />}
            label="Boissons"
            lien="/menu?categorie=boissons"
          />

          <Categorie
            icon={<Cake size={21} />}
            label="Desserts"
            lien="/menu?categorie=desserts"
          />

          <Categorie
            icon={<Flame size={21} />}
            label="Du jour"
            lien="/menu?categorie=plats-du-jour"
          />
        </div>
      </section>

      {/* PLATS DU JOUR */}
      <div className="mx-auto mt-8 max-w-6xl">
        <SectionPlatsDuJour onAjouter={handleAjouter} />
      </div>

      {/* NOS PLATS */}
      <Section
        icon={<UtensilsCrossed size={19} />}
        titre="Nos plats"
        description="Des recettes généreuses et savoureuses"
        produits={nosPlats}
        onAjouter={handleAjouter}
        lienVoirPlus="/menu?categorie=burgers"
      />

      {/* NOS BOISSONS */}
      <Section
        icon={<CupSoda size={19} />}
        titre="Nos boissons"
        description="De quoi accompagner votre repas"
        produits={nosBoissons}
        onAjouter={handleAjouter}
        lienVoirPlus="/menu?categorie=boissons"
      />

      {/* NOS DESSERTS */}
      <Section
        icon={<Cake size={19} />}
        titre="Nos desserts"
        description="Une touche sucrée pour finir en beauté"
        produits={nosDesserts}
        onAjouter={handleAjouter}
        lienVoirPlus="/menu?categorie=desserts"
      />

    </main>
  );
}

/* RACCOURCI DE CATÉGORIE */
function Categorie({ icon, label, lien }) {
  return (
    <Link
      to={lien}
      className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-1 py-4 transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] sm:py-5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>

      <span className="text-center text-[10px] font-semibold sm:text-sm">
        {label}
      </span>
    </Link>
  );
}

/* SECTION DE PRODUITS */
function Section({
  icon,
  titre,
  description,
  produits,
  onAjouter,
  lienVoirPlus,
}) {
  if (!produits.length) return null;

  return (
    <section className="mx-auto mt-9 max-w-6xl px-4 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-primary">{icon}</span>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              {titre}
            </h2>
          </div>

          <p className="mt-1 text-xs text-ink-light">
            {description}
          </p>
        </div>

        <Link
          to={lienVoirPlus}
          className="mb-1 inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary transition hover:underline"
        >
          Voir tout
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {produits.map((produit) => (
          <ProduitCarte
            key={produit.id}
            produit={produit}
            onAjouter={onAjouter}
          />
        ))}
      </div>
    </section>
  );
}
