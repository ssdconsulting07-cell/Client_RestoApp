import { describe, expect, it } from 'vitest';
import { creneauEnCours, etatPlat, jourDeService, serviceParDefaut } from './services';
import { populairesDabord } from './populaires';

// Heure de Dakar = UTC : dates construites en UTC.
const le = (iso) => new Date(`${iso}Z`);
const HORAIRES = [
  { service: 'DEJEUNER', debut: '11:00', fin: '15:00' },
  { service: 'DINER', debut: '18:00', fin: '01:00' },
];
// 2026-11-16 = lundi
describe('services du plat du jour', () => {
  it('dejeuner ouvert a midi, diner apres minuit = la veille', () => {
    expect(creneauEnCours(HORAIRES, le('2026-11-16T12:30:00'))).toEqual({ service: 'DEJEUNER', jour: 'LUNDI' });
    expect(creneauEnCours(HORAIRES, le('2026-11-16T20:00:00'))).toEqual({ service: 'DINER', jour: 'LUNDI' });
    expect(creneauEnCours(HORAIRES, le('2026-11-17T00:30:00'))).toEqual({ service: 'DINER', jour: 'LUNDI' });
    expect(creneauEnCours(HORAIRES, le('2026-11-16T16:00:00'))).toBeNull();
    expect(jourDeService(HORAIRES, le('2026-11-17T00:30:00'))).toBe('LUNDI');
  });

  it('service par defaut : en cours, sinon le prochain', () => {
    expect(serviceParDefaut(HORAIRES, le('2026-11-16T09:00:00'))).toBe('DEJEUNER');
    expect(serviceParDefaut(HORAIRES, le('2026-11-16T16:00:00'))).toBe('DINER');
  });

  it('plat en lecture seule hors service, avec une explication', () => {
    const plat = { jours: ['LUNDI'], dejeuner: false, diner: true };
    const midi = le('2026-11-16T12:30:00');
    expect(etatPlat(plat, { jour: 'LUNDI', service: 'DINER', horaires: HORAIRES, date: midi })).toEqual({
      commandable: false,
      message: 'Au dîner de 18 h à 1 h',
    });
    expect(etatPlat(plat, { jour: 'LUNDI', service: 'DINER', horaires: HORAIRES, date: le('2026-11-16T19:00:00') }).commandable).toBe(true);
    expect(etatPlat(plat, { jour: 'MARDI', service: 'DINER', horaires: HORAIRES, date: midi }).message).toMatch(/^Le mardi/);
  });
});

describe('accueil : populaires d abord', () => {
  it('tendance, puis les plus commandes, rupture a la fin', () => {
    const tries = populairesDabord([
      { id: 'a', popularite: 1 },
      { id: 'b', disponibilite: 'RUPTURE', tendance: true },
      { id: 'c', popularite: 9 },
      { id: 'd', tendance: true, popularite: 2 },
    ]).map((p) => p.id);
    expect(tries).toEqual(['d', 'c', 'a', 'b']);
  });
});
