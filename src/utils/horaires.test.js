import { describe, expect, it } from 'vitest';
import { horairesLisibles, joursLisibles } from './horaires';

describe('horaires d ouverture affiches', () => {
  it('regroupe les jours consecutifs', () => {
    expect(joursLisibles(['lundi', 'mardi', 'mercredi', 'jeudi'])).toBe('Lundi au jeudi');
    expect(joursLisibles(['samedi', 'vendredi'])).toBe('Vendredi, samedi');
    expect(joursLisibles(['dimanche'])).toBe('Dimanche');
    expect(joursLisibles(['lundi', 'mercredi', 'jeudi', 'vendredi'])).toBe('Lundi, mercredi au vendredi');
  });

  it('met en forme les plages, y compris apres minuit', () => {
    expect(horairesLisibles([
      { jours: ['lundi', 'mardi'], debut: '11:30', fin: '23:00' },
      { jours: ['samedi'], debut: '18:00', fin: '00:30' },
    ])).toEqual(['Lundi, mardi : 11 h 30 – 23 h', 'Samedi : 18 h – 0 h 30']);
  });

  it('ignore une configuration absente ou incomplete', () => {
    expect(horairesLisibles(undefined)).toEqual([]);
    expect(horairesLisibles([{ jours: [], debut: '10:00', fin: '12:00' }, { debut: '10:00' }])).toEqual([]);
  });
});
