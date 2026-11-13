import { beforeEach, describe, expect, it } from 'vitest';
import { jetonDe, memoriserJeton, oublierJetons } from './suivi';

describe('jetons de suivi (commandes de cet appareil)', () => {
  beforeEach(() => localStorage.clear());

  it('memorise et retrouve le jeton d une commande', () => {
    memoriserJeton(1042, 'secret-a');
    expect(jetonDe('1042')).toBe('secret-a');
    expect(jetonDe(9999)).toBeNull();
  });

  it('remplace le jeton d une meme commande sans doublon', () => {
    memoriserJeton('1', 'a');
    memoriserJeton('1', 'b');
    expect(jetonDe('1')).toBe('b');
    expect(JSON.parse(localStorage.getItem('senyummies_jetons_suivi'))).toHaveLength(1);
  });

  it('ne garde que les 30 commandes les plus recentes', () => {
    for (let i = 1; i <= 35; i += 1) memoriserJeton(i, `j${i}`);
    expect(jetonDe(35)).toBe('j35');
    expect(jetonDe(1)).toBeNull();
  });

  it('ignore un jeton absent (backend de demonstration) et oublie tout sur demande', () => {
    memoriserJeton('7', undefined);
    expect(jetonDe('7')).toBeNull();
    memoriserJeton('8', 'x');
    oublierJetons();
    expect(jetonDe('8')).toBeNull();
  });

  it('resiste a un stockage corrompu', () => {
    localStorage.setItem('senyummies_jetons_suivi', '{pas du json');
    expect(jetonDe('1')).toBeNull();
    memoriserJeton('1', 'ok');
    expect(jetonDe('1')).toBe('ok');
  });
});
