import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Plus, Flame, Cake, CupSoda } from 'lucide-react';
import { getProduits } from '../api/menu';
import { getCommandesParTelephone } from '../api/commandes';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatPrix } from '../utils/format';

export default function Accueil() {
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const { telephone } = useOrder();
  const { ajouter } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    getProduits().then(setProduits).catch(() => {});
  }, []);

  useEffect(() => {
    if (!telephone) return;
    getCommandesParTelephone(telephone).then(setCommandes).catch(() => {});
  }, [telephone]);

  const populaires = useMemo(() => {
    const compteur = {};
    commandes.forEach((cmd) => {
      (cmd.items || []).forEach((item) => {
        compteur[item.produitId] = (compteur[item.produitId] || 0) + item.quantite;
      });
    });

    if (Object.keys(compteur).length > 0) {
      const ids = Object.entries(compteur)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => Number(id));
      return produits.filter((p) => ids.includes(p.id));
    }
    return produits.slice(0, 3);
  }, [commandes, produits]);

  const desserts = produits.filter((p) => p.categorie === 'desserts');
  const boissons = produits.filter((p) => p.categorie === 'boissons');

  const handleAjouter = (produit) => {
    ajouter(produit);
    showToast(`${produit.nom} ajouté au panier`);
  };

  return (
    <div className="pb-8">
      {/* HERO */}
      <section className="relative w-full h-[55vh] min-h-[420px] flex flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=80"
          alt="Burger"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

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

      <Section
        icon={<Flame size={18} className="text-primary" />}
        titre="Les plus commandés"
        produits={populaires}
        onAjouter={handleAjouter}
      />
      {desserts.length > 0 && (
        <Section
          icon={<Cake size={18} className="text-primary" />}
          titre="Desserts"
          produits={desserts}
          onAjouter={handleAjouter}
        />
      )}
      {boissons.length > 0 && (
        <Section
          icon={<CupSoda size={18} className="text-primary" />}
          titre="Boissons"
          produits={boissons}
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
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-lg font-semibold">{titre}</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {produits.map((p) => {
          const dispo = p.disponible !== false;
          return (
            <div
              key={p.id}
              className={`min-w-[160px] max-w-[160px] bg-surface rounded-md shadow-card overflow-hidden flex flex-col ${
                !dispo ? 'opacity-50' : ''
              }`}
            >
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
              <div className="p-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold line-clamp-1">{p.nom}</p>
                  <p className="text-xs text-ink-light line-clamp-2 mt-0.5">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-primary">
                    {formatPrix(p.prix)}
                  </span>
                  {dispo ? (
                    <button
                      onClick={() => onAjouter(p)}
                      className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center active:scale-95"
                      aria-label="Ajouter au panier"
                    >
                      <Plus size={14} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-ink-light italic">
                      Indisponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}