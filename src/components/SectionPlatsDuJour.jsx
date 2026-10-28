import { useState } from 'react';
import { Flame, ChevronRight, Sun, Moon } from 'lucide-react';
import { produits } from '../data/produits';
import ModalPlatsDuJour from './ModalPlatsDuJour';

export default function SectionPlatsDuJour({ onAjouter }) {
  const [modaleOuverte, setModaleOuverte] = useState(false);

  const platsDuJour = produits.filter((p) => p.categorie === 'plats-du-jour');
  if (platsDuJour.length === 0) return null;

  const nbDejeuner = platsDuJour.filter((p) => p.moment === 'dejeuner').length;
  const nbDiner = platsDuJour.filter((p) => p.moment === 'diner').length;

  return (
    <>
      <section className="px-4 mt-6">
        <button
          onClick={() => setModaleOuverte(true)}
          className="w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-card active:scale-[0.99] transition-transform group"
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-black/10" />

          <div className="relative z-10 p-5 md:p-7">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
              <Flame size={12} />
              Aujourd'hui
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1">
              Plats du jour
            </h2>
            <p className="text-xs md:text-sm text-white/85 mb-4">
              {nbDejeuner} au déjeuner · {nbDiner} au dîner — commandez direct
            </p>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <Sun size={13} />
                Déjeuner
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <Moon size={13} />
                Dîner
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                Voir les plats du jour
              </span>
              <div className="w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </button>
      </section>

      <ModalPlatsDuJour
        ouvert={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        plats={platsDuJour}
        onAjouter={onAjouter}
      />
    </>
  );
}