import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function Accueil() {
  return (
    <section className="relative w-full h-[55vh] min-h-[420px] flex flex-col justify-end overflow-hidden">
      {/* Image de fond burger */}
      <img
        src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=80"
        alt="Burger Chez Ketchup"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay sombre dégradé */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

      {/* Contenu */}
      <div className="relative z-10 w-full px-6 pb-10 pt-10 text-white">
        <p className="text-[11px] tracking-[0.2em] uppercase text-white/80 mb-2">
          Commande en ligne · Dakar
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl leading-tight mb-3">
          Le goût ketchup, livré<br />chez toi.
        </h1>

        <p className="text-sm text-white/90 leading-relaxed mb-6 max-w-md">
          Burgers smashés, grillades et sauces maison — prêt en quelques clics.
        </p>

        <Link
          to="/menu"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-md text-base transition-colors mb-3"
        >
          <ShoppingBag size={18} />
          Commander maintenant
        </Link>

        <Link
          to="/menu"
          className="flex items-center justify-center gap-2 w-full border border-white/60 hover:bg-white/10 text-white font-semibold py-3.5 rounded-md text-base transition-colors"
        >
          Voir le menu
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}