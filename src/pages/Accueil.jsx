import { useMemo, useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
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

  // 👇 C'EST ICI QU'ON PASSE DE 4 À 3 PRODUITS PAR SECTION
  const { nosPlats, nosDesserts, nosBoissons } = useMemo(() => ({
    nosPlats: produits.filter((p) => p.categorie === 'burgers').slice(0, 3),
    nosDesserts: produits.filter((p) => p.categorie === 'desserts').slice(0, 3),
    nosBoissons: produits.filter((p) => p.categorie === 'boissons').slice(0, 3),
  }), []);

  const handleAjouter = (produit) => {
    if (produit.disponible === false) return;
    ajouter(produit);
    showToast(`${produit.nom} ajouté au panier`);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-alt pb-28 text-ink">
      {/* EN-TÊTE */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-3 pt-4 sm:px-6">
        <Link to="/" aria-label="Accueil" className="flex items-center gap-3">
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
          <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=85" alt="Burger gourmand" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/10 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/55 sm:to-transparent" />

          <div className="flex min-h-[420px] flex-col justify-end p-5 text-white sm:min-h-[470px] sm:p-9 lg:min-h-[500px] lg:p-12">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-md">
              <Sparkles size={14} />
              Commande en ligne · Dakar
            </div>

            <h1 className="max-w-xl font-serif text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Le goût du bonheur,<span className="mt-1 block text-primary">à chaque bouchée.</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/85 sm:text-base">
              Burgers gourmands, grillades et sauces maison. Choisissez vos envies et régalez-vous !
            </p>

            <div className="mt-7 max-w-xs">
              <Link to="/menu" className="flex w-full min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-[0.97]">
                <ShoppingBag size={20} />
                Commander maintenant
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
            <h2 className="text-lg font-bold sm:text-xl">Qu'est-ce qui vous tente ?</h2>
            <p className="mt-1 text-xs text-ink-light">Retrouvez vos envies en un clic.</p>
          </div>
          <Link to="/menu" className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:underline bg-primary/10 px-3 py-1.5 rounded-full">
            Tout voir
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <Categorie icon={<UtensilsCrossed size={21} />} label="Burgers" lien="/menu?categorie=burgers" />
          <Categorie icon={<CupSoda size={21} />} label="Boissons" lien="/menu?categorie=boissons" />
          <Categorie icon={<Cake size={21} />} label="Desserts" lien="/menu?categorie=desserts" />
          <Categorie icon={<Flame size={21} />} label="Du jour" lien="/menu?categorie=plats-du-jour" />
        </div>
      </section>

      {/* PLATS DU JOUR */}
      <div className="mx-auto mt-8 max-w-6xl">
        <SectionPlatsDuJour onAjouter={handleAjouter} />
      </div>

      {/* CARROUSEL SWIPE */}
      <CarrouselCategories 
        sections={[
          { id: 'plats', titre: 'Nos plats', icone: <UtensilsCrossed size={18} />, produits: nosPlats, lien: '/menu?categorie=burgers', desc: 'Des recettes généreuses et savoureuses' },
          { id: 'boissons', titre: 'Nos boissons', icone: <CupSoda size={18} />, produits: nosBoissons, lien: '/menu?categorie=boissons', desc: 'De quoi accompagner votre repas' },
          { id: 'desserts', titre: 'Nos desserts', icone: <Cake size={18} />, produits: nosDesserts, lien: '/menu?categorie=desserts', desc: 'Une touche sucrée pour finir en beauté' }
        ]}
        onAjouter={handleAjouter}
      />

    </main>
  );
}

function Categorie({ icon, label, lien }) {
  return (
    <Link to={lien} className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-1 py-4 transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] sm:py-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>
      <span className="text-center text-[10px] font-semibold sm:text-sm">
        {label}
      </span>
    </Link>
  );
}

/* 🎠 COMPOSANT CARROUSEL SWIPE PLUS VIVANT */
function CarrouselCategories({ sections, onAjouter }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToNext = (direction = 'right') => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    const carteWidth = clientWidth; 
    
    let cible = scrollLeft;

    if (direction === 'right') {
      if (scrollLeft + clientWidth >= scrollWidth - 50) {
        cible = 0;
      } else {
        cible = scrollLeft + carteWidth;
      }
    } else {
      cible = scrollLeft - carteWidth;
      if (cible < 0) cible = 0;
    }

    scrollRef.current.scrollTo({ 
      left: cible, 
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    let interval;
    if (!isPaused && scrollRef.current) {
      interval = setInterval(() => {
        scrollToNext('right');
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="mt-10 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">Découvrez notre carte</h2>
          <p className="mt-1 text-xs text-ink-light">Glissez pour explorer nos catégories.</p>
        </div>
        
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scrollToNext('left')} className="w-10 h-10 rounded-full border border-line bg-surface flex items-center justify-center hover:bg-surface-alt text-ink shadow-sm active:scale-90 transition-all duration-200">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => scrollToNext('right')} className="w-10 h-10 rounded-full border border-line bg-surface flex items-center justify-center hover:bg-surface-alt text-ink shadow-sm active:scale-90 transition-all duration-200">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '16px', 
          paddingLeft: '16px', 
          paddingRight: '16px', 
          paddingBottom: '16px',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth'
        }}
        className="scrollbar-hide"
      >
        {sections.map((section) => (
          <div 
            key={section.id}
            style={{ 
              flexShrink: 0,
              scrollSnapAlign: 'center' 
            }}
            // On centre la grille sur PC avec 3 colonnes
            className="w-[85vw] sm:w-full bg-surface border border-line rounded-3xl p-4 sm:p-6 shadow-sm transition-transform duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-primary scale-100 sm:scale-125">{section.icone}</span>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-ink leading-tight">{section.titre}</h3>
                  <p className="text-[10px] sm:text-xs text-ink-light mt-0.5 sm:mt-1">{section.desc}</p>
                </div>
              </div>
              <Link to={section.lien} className="text-xs sm:text-sm font-bold text-white bg-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-primary-dark transition flex items-center gap-1 sm:gap-2 shadow-sm">
                Voir tout
                <ArrowRight size={12} className="sm:w-4 sm:h-4" />
              </Link>
            </div>

            {/* 👇 Grille passée à 3 colonnes sur PC pour les 3 produits */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {section.produits.map((p) => (
                <ProduitCarte key={p.id} produit={p} onAjouter={onAjouter} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (petits points) */}
      <div className="flex justify-center gap-2 mt-2">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                const { clientWidth } = scrollRef.current;
                scrollRef.current.scrollTo({ left: index * clientWidth, behavior: 'smooth' });
              }
            }}
            className={`transition-all duration-300 rounded-full ${
              index === 0 
                ? 'w-6 h-2 bg-primary' 
                : 'w-2 h-2 bg-line hover:bg-primary/50'
            }`}
            aria-label={`Aller à la section ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}