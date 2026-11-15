// Services Dejeuner / Diner des plats du jour, memes regles que le backend
// (catalogue/application/Horaires.java) : heure de Dakar (UTC+0), un service
// peut finir apres minuit (18:00 - 01:00) et appartient alors au jour ou il
// a commence. Hors de son service, un plat reste VISIBLE (pour savoir a
// l'avance ce qu'il y aura) mais n'est pas commandable.
import { JOURS_SEMAINE, jourLabel } from './jours';

export const SERVICES = [
  { id: 'DEJEUNER', nom: 'Déjeuner' },
  { id: 'DINER', nom: 'Dîner' },
];

// Si l'API ne fournit pas encore les horaires (mock de demonstration).
export const HORAIRES_PAR_DEFAUT = [
  { service: 'DEJEUNER', debut: '11:00', fin: '15:00' },
  { service: 'DINER', debut: '18:00', fin: '01:00' },
];

const minutes = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** "18:00" -> "18 h", "11:30" -> "11 h 30". */
export function heureLisible(hhmm) {
  const [h, m] = String(hhmm || '').split(':');
  if (h === undefined) return '';
  return Number(m) ? `${Number(h)} h ${m}` : `${Number(h)} h`;
}

export const serviceNom = (id) => SERVICES.find((s) => s.id === id)?.nom || id;

export function horaireDe(horaires, service) {
  return (horaires?.length ? horaires : HORAIRES_PAR_DEFAUT).find((h) => h.service === service)
    || HORAIRES_PAR_DEFAUT.find((h) => h.service === service);
}

/** « de 18 h à 1 h » */
export const plageLisible = (h) => (h ? `de ${heureLisible(h.debut)} à ${heureLisible(h.fin)}` : '');

// Heure de Dakar = UTC (pas d'heure d'ete) : independante du fuseau de l'appareil.
const dakar = (date) => ({ minutes: date.getUTCHours() * 60 + date.getUTCMinutes(), jour: (date.getUTCDay() + 6) % 7 });

/**
 * Service ouvert a cet instant : { service, jour } (jour = jour de service,
 * la veille apres minuit pour un diner qui passe minuit), ou null.
 */
export function creneauEnCours(horaires, date = new Date()) {
  const { minutes: m, jour } = dakar(date);
  for (const s of SERVICES) {
    const h = horaireDe(horaires, s.id);
    const debut = minutes(h.debut);
    const fin = minutes(h.fin);
    if (fin > debut) {
      if (m >= debut && m < fin) return { service: s.id, jour: JOURS_SEMAINE[jour].id };
    } else if (m >= debut) {
      return { service: s.id, jour: JOURS_SEMAINE[jour].id };
    } else if (m < fin) {
      return { service: s.id, jour: JOURS_SEMAINE[(jour + 6) % 7].id };
    }
  }
  return null;
}

/** Jour affiche par defaut : jour du service en cours, sinon aujourd'hui (Dakar). */
export function jourDeService(horaires, date = new Date()) {
  return creneauEnCours(horaires, date)?.jour || JOURS_SEMAINE[dakar(date).jour].id;
}

/** Service a montrer par defaut : celui en cours, sinon le prochain de la journee. */
export function serviceParDefaut(horaires, date = new Date()) {
  const enCours = creneauEnCours(horaires, date);
  if (enCours) return enCours.service;
  const m = dakar(date).minutes;
  return m < minutes(horaireDe(horaires, 'DEJEUNER').fin) ? 'DEJEUNER' : 'DINER';
}

/** Jours d'un plat (nouveau champ jours[], ou l'ancien champ jour). */
export const joursDuPlat = (p) => (Array.isArray(p.jours) && p.jours.length ? p.jours : p.jour ? [p.jour] : []);

/** Le plat est propose a ce service (champs absents = les deux services). */
export const servi = (p, service) => (service === 'DEJEUNER' ? p.dejeuner !== false : p.diner !== false);

/**
 * Etat d'un plat pour un jour et un service donnes : { commandable, message }.
 * Le message explique au client pourquoi il ne peut pas commander (et quand
 * il le pourra), pour qu'il ne croie pas a un bug.
 */
export function etatPlat(p, { jour, service, horaires, date = new Date() }) {
  const h = horaireDe(horaires, service);
  const enCours = creneauEnCours(horaires, date);
  if (enCours && enCours.service === service && enCours.jour === jour && joursDuPlat(p).includes(jour) && servi(p, service)) {
    return { commandable: true, message: '' };
  }
  const quand = `${serviceNom(service).toLowerCase()} ${plageLisible(h)}`;
  if (jour !== jourDeService(horaires, date)) {
    return { commandable: false, message: `Le ${jourLabel(jour).toLowerCase()}, au ${quand}` };
  }
  return { commandable: false, message: `Au ${quand}` };
}
