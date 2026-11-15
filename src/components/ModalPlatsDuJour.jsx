import { useEffect, useState } from 'react';
import { X, Flame, Clock } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { useCatalogue } from '../context/CatalogueContext';
import { JOURS_SEMAINE, jourLabel } from '../utils/jours';
import {
  SERVICES,
  creneauEnCours,
  etatPlat,
  horaireDe,
  jourDeService,
  joursDuPlat,
  plageLisible,
  servi,
  serviceParDefaut,
} from '../utils/services';
import ProduitCarte from './ProduitCarte';

// Programme des plats du jour : onglets Dejeuner / Diner, puis jours de la
// semaine. Tout est consultable a l'avance ; on ne commande que pendant le
// service en cours. Hors service, un bandeau explique quand le plat sera
// commandable (pour que le client ne croie pas a un bug).
export default function ModalPlatsDuJour({ ouvert, onFermer, plats, onAjouter }) {
  const { horaires, maintenant } = useCatalogue();
  const jourService = jourDeService(horaires, maintenant);
  const [jour, setJour] = useState(jourService);
  const [service, setService] = useState(() => serviceParDefaut(horaires, maintenant));
  const [visible, setVisible] = useState(false);

  useScrollLock(ouvert);

  useEffect(() => {
    if (ouvert) {
      setJour(jourDeService(horaires, new Date()));
      setService(serviceParDefaut(horaires, new Date()));
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  // Sur petit ecran, l'onglet du jour peut etre hors champ : on fait defiler
  // la barre d'onglets pour le montrer.
  const centrerOnglet = (el) => {
    if (!el) return;
    const barre = el.closest('[data-onglets]');
    if (!barre) return;
    barre.scrollLeft = el.offsetLeft - (barre.clientWidth - el.offsetWidth) / 2;
  };

  const duService = (j) => plats.filter((p) => joursDuPlat(p).includes(j) && servi(p, service));
  const platsChoisis = duService(jour);
  const enCours = creneauEnCours(horaires, maintenant);
  const ouvertMaintenant = enCours && enCours.service === service && enCours.jour === jour;
  const horaire = horaireDe(horaires, service);
  const serviceLibelle = service === 'DEJEUNER' ? 'déjeuner' : 'dîner';

  let bandeau = '';
  if (platsChoisis.length > 0 && !ouvertMaintenant) {
    bandeau =
      jour === jourService
        ? `Consultation seulement : ces plats se commandent pendant le ${serviceLibelle}, ${plageLisible(horaire)}.`
        : `Consultation seulement : ces plats se commandent le ${jourLabel(jour).toLowerCase()}, au ${serviceLibelle} (${plageLisible(horaire)}).`;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-plats-du-jour"
      className={`fixed inset-0 z-[200] flex items-end justify-center bg-black/70 transition-opacity duration-300 sm:items-center sm:p-6 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onFermer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl transition-transform duration-300 ease-out sm:max-h-[85dvh] sm:max-w-2xl sm:rounded-3xl lg:max-w-3xl ${
          visible ? 'translate-y-0' : 'translate-y-full sm:translate-y-6'
        }`}
      >
        <div className="relative shrink-0 bg-gradient-to-br from-primary to-primary-dark px-5 pb-4 pt-5 text-white">
          <button
            type="button"
            onClick={onFermer}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/90">
            <Flame size={14} aria-hidden="true" /> Programme de la semaine
          </p>
          <h2 id="titre-plats-du-jour" className="text-2xl font-bold">Plats du jour</h2>

          {/* Services : toujours ouverts a la consultation */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/15 p-1" role="tablist" aria-label="Service">
            {SERVICES.map((s) => {
              const actif = s.id === service;
              const h = horaireDe(horaires, s.id);
              const enDirect = enCours?.service === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={actif}
                  onClick={() => setService(s.id)}
                  className={`min-h-12 rounded-xl px-3 text-left transition-colors ${
                    actif ? 'bg-white text-primary shadow' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    {s.nom}
                    {enDirect && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${actif ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                        En cours
                      </span>
                    )}
                  </span>
                  <span className={`block text-[11px] ${actif ? 'text-primary/80' : 'text-white/80'}`}>{plageLisible(h)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jours : defilement horizontal, sans deborder de l'ecran */}
        <div data-onglets className="relative shrink-0 overflow-x-auto scroll-smooth border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 px-4 py-3" role="tablist" aria-label="Jour de la semaine">
            {JOURS_SEMAINE.map((j) => {
              const nb = duService(j.id).length;
              const actif = j.id === jour;
              return (
                <button
                  key={j.id}
                  ref={actif ? centrerOnglet : undefined}
                  type="button"
                  role="tab"
                  aria-selected={actif}
                  onClick={() => setJour(j.id)}
                  className={`min-h-10 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                    actif ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink'
                  } ${nb === 0 && !actif ? 'opacity-50' : ''}`}
                >
                  {j.id === jourService ? "Aujourd'hui" : j.nom}
                  {nb > 0 && <span className="ml-1 opacity-75">({nb})</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
          {bandeau && (
            <p className="mb-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-surface px-3 py-2.5 text-xs text-ink">
              <Clock size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{bandeau}</span>
            </p>
          )}
          {platsChoisis.length === 0 ? (
            <p className="py-12 text-center text-sm italic text-ink-light">
              Aucun plat prévu au {serviceLibelle} {jour === jourService ? "aujourd'hui" : `le ${jourLabel(jour).toLowerCase()}`}.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {platsChoisis.map((p) => {
                const etat = etatPlat(p, { jour, service, horaires, date: maintenant });
                return (
                  <ProduitCarte
                    key={p.id}
                    produit={p}
                    categorieNom="Plat du jour"
                    onAjouter={onAjouter}
                    desactive={!etat.commandable}
                    mentionIndispo={etat.message}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
