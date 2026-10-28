import { Plus } from 'lucide-react';
import { formatPrix } from '../utils/format';

export default function ProduitCarte({ produit: p, onAjouter, populaire }) {
  const dispo = p.disponible !== false;
  const estPopulaire = populaire ?? p.id % 3 === 0;

  return (
    <div
      className={`bg-surface rounded-lg shadow-card overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5 hover:shadow-lg ${
        !dispo ? 'opacity-50' : ''
      }`}
    >
      <div className="relative aspect-[4/3] bg-line">
        <img
          src={p.photo}
          alt={p.nom}
          className={`w-full h-full object-cover ${!dispo ? 'grayscale' : ''}`}
        />
        {estPopulaire && dispo && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
            Populaire
          </span>
        )}
        {!dispo && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-danger text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Rupture
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-sm line-clamp-1 text-ink">{p.nom}</p>
          <p className="text-xs text-ink-light line-clamp-2 mt-0.5 leading-snug">
            {p.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-primary text-sm">
            {formatPrix(p.prix)}
          </span>
          {dispo ? (
            <button
              onClick={() => onAjouter(p)}
              className="w-9 h-9 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center active:scale-95 transition-all shadow-sm"
              aria-label={`Ajouter ${p.nom}`}
            >
              <Plus size={16} />
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
}