import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Plus, Flame, Cake, UtensilsCrossed } from 'lucide-react';
import { getProduits } from '../api/menu';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrix } from '../utils/format';
import BoutonNotif from '../components/BoutonNotif';

export default function Accueil() {
  const [produits, setProduits] = useState([]);
  const { ajouter } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    getProduits().then(setProduits).catch(() => {});
  }, []);

  const menuDuJour = produits.slice(0, 2);
  const nosPlats = produits
    .filter((p) => ['burgers', 'accompagnements'].includes(p.categorie))
    .slice(0, 2);
  const nosDesserts = produits
    .filter((p) => p.categorie === 'desserts')
    .slice(0, 2);

  const handleAjouter = (produit) => {
    ajouter(produit);
    showToast(`${produit.nom} ajouté au panier`);
  };

  return (
    <div className="pb-8">
      <section className="relative w-full h-[55vh] min-h-[420px] flex flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=80"
          alt="Burger"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        <div className="absolute top-4 right-4 z-20">
          <BoutonNotif />
        </div>
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

      {menuDuJour.length > 0 && (
        <Section
          icon={<Flame size={18} className="text-primary" />}
          titre="Menu du jour"
          produits={menuDuJour}
          onAjouter={handleAjouter}
        />
      )}
      {nosPlats.length > 0 && (
        <Section
          icon={<UtensilsCrossed size={18} className="text-primary" />}
          titre="Nos plats"
          produits={nosPlats}
          onAjouter={handleAjouter}
        />
      )}
      {nosDesserts.length > 0 && (
        <Section
          icon={<Cake size={18} className="text-primary" />}
          titre="Nos desserts"
          produits={nosDesserts}
          onAjouter={handleAjouter}
        />
      )}
    </div>
  );
}

function Section({ icon, titre, produits, onAjouter }) {
  if (!produits.length) return null;
  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{titre}</h2>
        </div>
        <Link
          to="/menu"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Voir plus
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {produits.map((p) => (
          <ProduitCarte key={p.id} produit={p} onAjouter={onAjouter} />
        ))}
      </div>
    </section>
  );
}

function ProduitCarte({ produit: p, onAjouter }) {
  const dispo = p.disponible !== false;
  return (
    <div className={`bg-surface rounded-md shadow-card overflow-hidden flex flex-col ${!dispo ? 'opacity-50' : ''}`}>
      <div className="relative h-28 bg-line">
        <img
          src={p.photo}
          alt={p.nom}
          className={`w-full h-full object-cover ${!dispo ? 'grayscale' : ''}`}
        />
        {!dispo && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-danger text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
              Rupture
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-sm line-clamp-1">{p.nom}</p>
          <p className="text-xs text-ink-light line-clamp-2 mt-0.5">{p.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-primary text-sm">{formatPrix(p.prix)}</span>
          {dispo ? (
            <button
              onClick={() => onAjouter(p)}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center active:scale-95"
            >
              <Plus size={16} />
            </button>
          ) : (
            <span className="text-[10px] text-ink-light italic">Indisponible</span>
          )}
        </div>
      </div>
    </div>
  );
} 