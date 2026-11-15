import { useState } from 'react';
import { Flame, ChevronRight, CalendarDays } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { jourLabel } from '../utils/jours';
import {
  creneauEnCours,
  horaireDe,
  jourDeService,
  joursDuPlat,
  plageLisible,
  servi,
  serviceNom,
  serviceParDefaut,
} from '../utils/services';
import ModalPlatsDuJour from './ModalPlatsDuJour';
import { SqueletteBandeau } from './EtatChargement';

// Plats du jour publies par le Gerant (Manager, page Plats du jour) : fiches
// independantes du catalogue, proposees un ou plusieurs jours, au dejeuner
// et / ou au diner. Un plat ne se commande que pendant son service ; le
// reste du temps il reste visible (lecture seule) avec ses horaires.
export default function SectionPlatsDuJour({ onAjouter }) {
  const { platsDuJour, horaires, maintenant, chargement } = useCatalogue();
  const [modaleOuverte, setModaleOuverte] = useState(false);

  if (platsDuJour.length === 0) return chargement ? <SqueletteBandeau /> : null;

  const aujourdhui = jourDeService(horaires, maintenant);
  const service = serviceParDefaut(horaires, maintenant);
  const ouvert = creneauEnCours(horaires, maintenant)?.service === service;
  const platsAujourdhui = platsDuJour.filter((p) => joursDuPlat(p).includes(aujourdhui) && servi(p, service));
  const horaire = horaireDe(horaires, service);

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
              <Flame size={12} aria-hidden="true" /> {jourLabel(aujourdhui)} · {serviceNom(service)}
            </span>
            <h2 className="mb-1 text-2xl font-bold text-white md:text-3xl">Plats du jour</h2>
            <p className="mb-4 text-sm text-white/85">
              {platsAujourdhui.length === 0
                ? 'Pas de plat prévu pour ce service — découvrez le programme de la semaine'
                : ouvert
                  ? `${platsAujourdhui.length} plat${platsAujourdhui.length > 1 ? 's' : ''} à commander maintenant`
                  : `${platsAujourdhui.length} plat${platsAujourdhui.length > 1 ? 's' : ''} au ${serviceNom(service).toLowerCase()}, ${plageLisible(horaire)}`}
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
