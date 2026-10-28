import { Phone, Star, Bike } from 'lucide-react';

export default function CarteLivreur({ livreur }) {
  if (!livreur) return null;

  return (
    <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={livreur.photo}
            alt={livreur.nom}
            className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white object-cover shadow"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Votre livreur
            </p>
            <p className="truncate text-sm font-bold text-ink">{livreur.nom}</p>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-light">
              <span className="flex items-center gap-0.5">
                <Star size={10} className="fill-amber-500 text-amber-500" />
                {livreur.note}
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Bike size={11} />
                {livreur.vehicule}
              </span>
            </div>
          </div>
        </div>

        <a
          href={`tel:${livreur.telephone}`}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          aria-label={`Appeler ${livreur.nom}`}
        >
          <Phone size={18} />
        </a>
      </div>
    </div>
  );
}