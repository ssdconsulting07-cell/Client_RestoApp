import { describe, expect, it } from 'vitest';
import { formaterTelephone, normaliserTelephone } from './telephone';
import { nouvelleCle, urlPaiementSure } from './paiement';
import { distanceKm, RAYON_ZONE_KM, zoneDepuisPosition } from './geo';
import { formatPrix } from './format';
import { jourCourant, jourLabel } from './jours';
import { tempsRelatif } from './date';
import {
  contenuQrLivraison,
  detailStatut,
  etapesPourMode,
  normaliserStatut,
  ticketId,
} from './statuts';

describe('telephone', () => {
  it.each([
    ['77 123 45 67', '+221771234567'],
    ['+221 77 123 45 67', '+221771234567'],
    ['00221771234567', '+221771234567'],
    ['221701234567', '+221701234567'],
    ['338201234', '+221338201234'],
  ])('normalise %s', (saisie, attendu) => {
    expect(normaliserTelephone(saisie)).toBe(attendu);
  });

  it.each(['', null, '12345', '721234567', '7712345678', '+33612345678'])('refuse %s', (saisie) => {
    expect(normaliserTelephone(saisie)).toBeNull();
  });

  it('formate pour l affichage', () => {
    expect(formaterTelephone('+221771234567')).toBe('77 123 45 67');
    expect(formaterTelephone('abc')).toBe('abc');
    expect(formaterTelephone(null)).toBe('');
  });
});

describe('paiement en ligne', () => {
  it('genere des cles d idempotence uniques au format UUID', () => {
    const a = nouvelleCle();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(nouvelleCle()).not.toBe(a);
  });

  it('ne suit que des pages de paiement https', () => {
    expect(urlPaiementSure('https://paiement.exemple.sn/checkout/abc')).toBe('https://paiement.exemple.sn/checkout/abc');
    expect(urlPaiementSure('http://paiement.exemple.sn')).toBeNull();
    expect(urlPaiementSure('javascript:alert(1)')).toBeNull();
    expect(urlPaiementSure('data:text/html,x')).toBeNull();
    expect(urlPaiementSure('/relatif')).toBeNull();
    expect(urlPaiementSure(null)).toBeNull();
  });
});

describe('geolocalisation', () => {
  const plateau = { latitude: 14.6697, longitude: -17.4381 };
  const almadies = { latitude: 14.7444, longitude: -17.5133 };

  it('calcule une distance realiste', () => {
    expect(distanceKm(plateau, plateau)).toBe(0);
    const d = distanceKm(plateau, almadies);
    expect(d).toBeGreaterThan(10);
    expect(d).toBeLessThan(12);
  });

  it('choisit la zone la plus proche dans le rayon', () => {
    const secteurs = [
      { id: 'sans-centre' },
      { id: 'plateau', centre: plateau },
      { id: 'almadies', centre: almadies },
    ];
    expect(zoneDepuisPosition(secteurs, { latitude: 14.67, longitude: -17.44 }).id).toBe('plateau');
    expect(zoneDepuisPosition(secteurs, { latitude: 14.74, longitude: -17.51 }).id).toBe('almadies');
  });

  it('ne choisit rien hors du rayon', () => {
    const loin = { latitude: 14.7167 + RAYON_ZONE_KM, longitude: -17.4677 };
    expect(zoneDepuisPosition([{ id: 'plateau', centre: plateau }], loin)).toBeNull();
  });
});

describe('format et dates', () => {
  it('affiche les montants en F CFA sans espace fine', () => {
    expect(formatPrix(3500)).toBe('3 500 F CFA');
    expect(formatPrix(null)).toBe('0 F CFA');
  });

  it('donne le jour du plat du jour (lundi en premier)', () => {
    expect(jourCourant(new Date(2026, 10, 15))).toBe('DIMANCHE');
    expect(jourCourant(new Date(2026, 10, 16))).toBe('LUNDI');
    expect(jourLabel('MERCREDI')).toBe('Mercredi');
    expect(jourLabel('INCONNU')).toBe('INCONNU');
  });

  it('exprime un temps relatif', () => {
    const il = (min) => new Date(Date.now() - min * 60000).toISOString();
    expect(tempsRelatif(il(0))).toBe("à l'instant");
    expect(tempsRelatif(il(5))).toBe('il y a 5 min');
    expect(tempsRelatif(il(120))).toBe('il y a 2 h');
    expect(tempsRelatif(il(60 * 30))).toBe('hier');
    expect(tempsRelatif('pas une date')).toBe('');
  });
});

describe('statuts de commande (alignes sur le Manager)', () => {
  it('donne les etapes selon le mode', () => {
    expect(etapesPourMode('RETRAIT')).toEqual(['PAYEE', 'EN_PREPARATION', 'PRETE', 'RETIREE']);
    expect(etapesPourMode('LIVRAISON').at(-1)).toBe('LIVREE');
  });

  it('normalise les statuts inconnus ou en minuscules', () => {
    expect(normaliserStatut('en_livraison')).toBe('EN_LIVRAISON');
    expect(normaliserStatut('CREEE')).toBe('CREEE');
    expect(normaliserStatut('???')).toBe('PAYEE');
  });

  it('explique l attente de paiement et l echec', () => {
    expect(detailStatut('CREEE', 'LIVRAISON')).toMatch(/confirmation de votre paiement/);
    expect(detailStatut('ANNULEE', 'LIVRAISON', 'echoue')).toMatch(/paiement n.a pas abouti/);
    expect(detailStatut('ANNULEE', 'LIVRAISON', 'paye')).toMatch(/annulée par le restaurant/);
  });

  it('adapte le message au mode', () => {
    expect(detailStatut('PRETE', 'RETRAIT')).toMatch(/comptoir/);
    expect(detailStatut('PRETE', 'LIVRAISON')).toMatch(/livreur/);
  });

  it('produit le QR attendu par le scan du Livreur', () => {
    expect(ticketId({ id: 'demo-2041' })).toBe('2041');
    expect(contenuQrLivraison({ id: 1002 })).toBe('SENYUMMIES-1002');
    expect(ticketId(null)).toBe('');
  });
});
