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

describe('fiche complete d un restaurant (npm run client)', () => {
  it('par defaut : textes, banniere, paiements et modes de SenYummies', async () => {
    const { marque } = await charger();
    expect(marque.banniere).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(marque.accueilBadge).toBe('Sans compte · Paiement mobile');
    expect(marque.splash).toBe('');
    expect(marque.paiements).toEqual(['wave', 'orange-money', 'mixx-yas', 'carte', 'especes']);
    expect(marque.modes).toEqual(['LIVRAISON', 'RETRAIT']);
    expect(marque.reseaux).toEqual({});
    expect(marque.horaires).toEqual([]);
    expect(marque.nomCourt).toBe('SenYummies');
  });

  it('lit couleurs, images, textes, offre et coordonnees de config.js', async () => {
    const { marque, appliquerMarque } = await charger({
      MARQUE_NOM: 'Kër Saveurs',
      MARQUE_NOM_COURT: 'Kër',
      MARQUE_COULEUR: '#1F7A4D',
      MARQUE_COULEUR_FONCEE: '#165C3A',
      MARQUE_COULEUR_CLAIRE: '#F4B942',
      MARQUE_LOGO_URL: '/marque/logo.svg',
      MARQUE_BANNIERE_URL: '/marque/banniere.jpg',
      MARQUE_SPLASH_URL: '/marque/splash.jpg',
      MARQUE_ACCUEIL_BADGE: 'Braisé à la minute',
      MARQUE_PAIEMENTS: 'orange-money, WAVE, cheque',
      MARQUE_MODES: 'retrait',
      MARQUE_RESEAUX: '{"whatsapp":"+221770000000"}',
      MARQUE_HORAIRES: '[{"jours":["lundi"],"debut":"11:30","fin":"23:00"}]',
    });
    expect(marque.logo).toBe('/marque/logo.svg');
    expect(marque.banniere).toBe('/marque/banniere.jpg');
    expect(marque.splash).toBe('/marque/splash.jpg');
    expect(marque.accueilBadge).toBe('Braisé à la minute');
    expect(marque.nomCourt).toBe('Kër');
    // Ordre canonique, code inconnu ignore.
    expect(marque.paiements).toEqual(['wave', 'orange-money']);
    expect(marque.modes).toEqual(['RETRAIT']);
    expect(marque.reseaux.whatsapp).toBe('+221770000000');
    expect(marque.horaires).toHaveLength(1);
    expect(marque.couleurClaireRgb).toEqual([244, 185, 66]);
    appliquerMarque(marque, document);
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--marque')).toBe('31 122 77');
    expect(style.getPropertyValue('--marque-fonce')).toBe('22 92 58');
    expect(style.getPropertyValue('--marque-clair')).toBe('244 185 66');
  });

  it('JSON invalide : valeur par defaut, pas de plantage', async () => {
    const { marque } = await charger({ MARQUE_RESEAUX: '{pas du json', MARQUE_HORAIRES: 'lundi' });
    expect(marque.reseaux).toEqual({});
    expect(marque.horaires).toEqual([]);
  });
});
