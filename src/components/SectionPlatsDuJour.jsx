import { useState } from 'react';
import { Flame, ChevronRight, CalendarDays } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { jourCourant, jourLabel } from '../utils/jours';
import ModalPlatsDuJour from './ModalPlatsDuJour';

// Plats du jour publies par le Gerant (Manager, page Plats du jour) : fiches
// independantes du catalogue, chacune rattachee a UN jour de la semaine.
// Seuls les plats du jour courant sont commandables ; le programme de la
// semaine reste consultable dans la modale.
export default function SectionPlatsDuJour({ onAjouter }) {
  const { platsDuJour } = useCatalogue();
  const [modaleOuverte, setModaleOuverte] = useState(false);

  if (platsDuJour.length === 0) return null;

  const aujourdhui = jourCourant();
  const platsAujourdhui = platsDuJour.filter((p) => p.jour === aujourdhui);

  return (
    <>
      <section className="px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setModaleOuverte(true)}
          className="group relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-left shadow-card transition-transform active:scale-[0.99]"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-black/10" />

          <div className="relative z-10 p-5 md:p-7">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Flame size={12} aria-hidden="true" /> {jourLabel(aujourdhui)}
            </span>
            <h2 className="mb-1 text-2xl font-bold text-white md:text-3xl">Plats du jour</h2>
            <p className="mb-4 text-sm text-white/85">
              {platsAujourdhui.length > 0
                ? `${platsAujourdhui.length} plat${platsAujourdhui.length > 1 ? 's' : ''} à commander aujourd'hui`
                : "Pas de plat du jour aujourd'hui — découvrez le programme de la semaine"}
            </p>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <CalendarDays size={16} aria-hidden="true" />
                {platsAujourdhui.length > 0 ? 'Voir les plats' : 'Voir la semaine'}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-md transition-transform group-hover:translate-x-1">
                <ChevronRight size={18} aria-hidden="true" />
              </span>
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
