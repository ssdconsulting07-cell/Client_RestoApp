import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  delete window.__SENYUMMIES_CONFIG__;
  vi.resetModules();
});

const charger = async (config) => {
  if (config) window.__SENYUMMIES_CONFIG__ = config;
  return import('./marque');
};

describe('marque par defaut', () => {
  it('reste SenYummies, rouge #A6192E, SEN + YUMMIES', async () => {
    const { marque, nomEnDeuxTons } = await charger();
    expect(marque.nom).toBe('SenYummies');
    expect(marque.initiales).toBe('SY');
    expect(marque.couleur).toBe('#A6192E');
    expect(marque.couleurClaireRgb).toEqual([255, 107, 125]);
    expect(nomEnDeuxTons()).toEqual({ debut: 'Sen', accent: 'Yummies' });
  });
});

describe('marque d un autre restaurant (config.js)', () => {
  it('prend le nom, la couleur et deduit les initiales', async () => {
    const { marque, nomEnDeuxTons } = await charger({ MARQUE_NOM: 'Chez Fatou', MARQUE_COULEUR: '#1f6f57' });
    expect(marque.nom).toBe('Chez Fatou');
    expect(marque.initiales).toBe('CF');
    expect(marque.couleur).toBe('#1F6F57');
    // Pas d'accent herite de SenYummies.
    expect(nomEnDeuxTons()).toEqual({ debut: 'Chez Fatou', accent: '' });
    // Teinte claire calculee (plus claire que la couleur principale).
    marque.couleurClaireRgb.forEach((c, i) => expect(c).toBeGreaterThan(marque.couleurRgb[i]));
  });

  it('accent et initiales explicites', async () => {
    const { marque, nomEnDeuxTons } = await charger({
      MARQUE_NOM: 'Chez Fatou',
      MARQUE_NOM_ACCENT: 'Fatou',
      MARQUE_INITIALES: 'F',
    });
    expect(marque.initiales).toBe('F');
    expect(nomEnDeuxTons()).toEqual({ debut: 'Chez ', accent: 'Fatou' });
  });

  it('ignore une couleur invalide', async () => {
    const { marque } = await charger({ MARQUE_COULEUR: 'rouge' });
    expect(marque.couleur).toBe('#A6192E');
  });
});

describe('outils', () => {
  it('initiales, couleurs et slogan', async () => {
    const { initialesDe, rgbDe, nuance, sloganEnDeuxLignes } = await charger();
    expect(initialesDe('SenYummies')).toBe('SY');
    expect(initialesDe('Le Baobab')).toBe('LB');
    expect(initialesDe('kfc')).toBe('KF');
    expect(rgbDe('#a19')).toEqual([170, 17, 153]);
    expect(rgbDe('pas une couleur')).toBeNull();
    expect(nuance([100, 100, 100], 0.5)).toEqual([178, 178, 178]);
    expect(nuance([100, 100, 100], -0.5)).toEqual([50, 50, 50]);
    expect(sloganEnDeuxLignes('Bon, et pas cher.')).toEqual({ ligne1: 'Bon,', ligne2: 'et pas cher.' });
    expect(sloganEnDeuxLignes('Sans virgule')).toEqual({ ligne1: 'Sans virgule', ligne2: '' });
  });

  it('applique couleur, titre et barre du navigateur a la page', async () => {
    const { marque, appliquerMarque } = await charger({ MARQUE_NOM: 'Le Baobab', MARQUE_COULEUR: '#003881' });
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
    appliquerMarque(marque, document);
    expect(document.documentElement.style.getPropertyValue('--marque')).toBe('0 56 129');
    expect(document.title).toBe('Le Baobab');
    expect(meta.getAttribute('content')).toBe('#003881');
    meta.remove();
  });
});
