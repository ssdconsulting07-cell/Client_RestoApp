// Fiche marque du restaurant : nom, monogramme ou logo, couleur, slogan.
//
// La meme application sert plusieurs restaurants : rien de la marque n'est
// ecrit dans les ecrans. Tout vient de la configuration, dans cet ordre :
// /config.js genere au demarrage du conteneur (variables MARQUE_*, voir
// docker/40-config-runtime.sh) > variables VITE_MARQUE_* du .env > valeurs
// par defaut (SenYummies).
import { configuration } from './runtime';

const env = import.meta.env;

const DEFAUT = {
  nom: 'SenYummies',
  accent: 'Yummies',
  slogan: 'Le goût du bonheur, à chaque bouchée.',
  sousTitre: 'Commande en ligne · Dakar',
  couleur: '#A6192E',
  // Teinte claire d'accent (nom et slogan sur fond sombre) de la marque par defaut.
  couleurClaire: '#FF6B7D',
};

const nom = configuration('MARQUE_NOM', env.VITE_MARQUE_NOM, DEFAUT.nom);
// L'accent par defaut ("Yummies") ne vaut que pour le nom par defaut.
const accentParDefaut = nom === DEFAUT.nom ? DEFAUT.accent : '';

/** Initiales du monogramme : majuscules du nom ("SenYummies" -> "SY"), sinon 2 premieres lettres. */
export function initialesDe(texte) {
  const mots = String(texte).trim().split(/\s+/).filter(Boolean);
  const majuscules = String(texte).replace(/[^A-ZÀ-Ý]/g, '');
  if (mots.length > 1) return mots.slice(0, 2).map((m) => m[0]).join('').toUpperCase();
  if (majuscules.length >= 2) return majuscules.slice(0, 2);
  return String(texte).trim().slice(0, 2).toUpperCase();
}

/** "#A6192E" ou "A6192E" ou "#a19" -> [166, 25, 46] ; null si invalide. */
export function rgbDe(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** Melange d'une couleur avec du blanc (part > 0) ou du noir (part < 0). */
export function nuance(rgb, part) {
  const cible = part > 0 ? 255 : 0;
  const p = Math.abs(part);
  return rgb.map((c) => Math.round(c + (cible - c) * p));
}

const couleurSaisie = configuration('MARQUE_COULEUR', env.VITE_MARQUE_COULEUR, DEFAUT.couleur);
const couleurRgb = rgbDe(couleurSaisie) || rgbDe(DEFAUT.couleur);
const couleurParDefaut = couleurRgb.join() === rgbDe(DEFAUT.couleur).join();
// Teinte claire : fixee (MARQUE_COULEUR_CLAIRE), celle de la marque par
// defaut, ou calculee depuis la couleur principale.
const couleurClaireRgb =
  rgbDe(configuration('MARQUE_COULEUR_CLAIRE', env.VITE_MARQUE_COULEUR_CLAIRE, '')) ||
  (couleurParDefaut ? rgbDe(DEFAUT.couleurClaire) : nuance(couleurRgb, 0.45));

export const marque = Object.freeze({
  nom,
  // Partie du nom mise en couleur (fin du nom) : "SenYummies" -> SEN + YUMMIES.
  accent: configuration('MARQUE_NOM_ACCENT', env.VITE_MARQUE_NOM_ACCENT, accentParDefaut),
  initiales: configuration('MARQUE_INITIALES', env.VITE_MARQUE_INITIALES, initialesDe(nom)),
  // URL d'un logo (carre, fond transparent ou plein) : remplace le monogramme.
  logo: configuration('MARQUE_LOGO_URL', env.VITE_MARQUE_LOGO_URL, ''),
  slogan: configuration('MARQUE_SLOGAN', env.VITE_MARQUE_SLOGAN, DEFAUT.slogan),
  sousTitre: configuration('MARQUE_SOUS_TITRE', env.VITE_MARQUE_SOUS_TITRE, DEFAUT.sousTitre),
  couleur: `#${couleurRgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase(),
  couleurRgb,
  couleurClaireRgb,
});

/** Nom decoupe pour l'affichage en deux tons : { debut, accent }. */
export function nomEnDeuxTons(m = marque) {
  const { nom: n, accent } = m;
  if (accent && n.toLowerCase().endsWith(accent.toLowerCase()) && accent.length < n.length) {
    return { debut: n.slice(0, n.length - accent.length), accent: n.slice(n.length - accent.length) };
  }
  return { debut: n, accent: '' };
}

/** Slogan en deux lignes, coupe a la premiere virgule : { ligne1, ligne2 }. */
export function sloganEnDeuxLignes(s = marque.slogan) {
  const i = s.indexOf(',');
  if (i < 0) return { ligne1: s, ligne2: '' };
  return { ligne1: s.slice(0, i + 1), ligne2: s.slice(i + 1).trim() };
}

/**
 * Applique la marque a la page, avant le premier rendu : variables CSS de
 * couleur (utilisees par Tailwind : bg-primary, text-primary...), titre de
 * l'onglet et couleur de la barre du navigateur.
 */
export function appliquerMarque(m = marque, doc = document) {
  const racine = doc.documentElement.style;
  const triplet = (rgb) => rgb.join(' ');
  racine.setProperty('--marque', triplet(m.couleurRgb));
  racine.setProperty('--marque-fonce', triplet(nuance(m.couleurRgb, -0.17)));
  racine.setProperty('--marque-clair', triplet(m.couleurClaireRgb));
  racine.setProperty('--marque-sombre', triplet(nuance(m.couleurRgb, -0.45)));
  racine.setProperty('--marque-nuit', triplet(nuance(m.couleurRgb, -0.75)));
  doc.title = m.nom;
  const theme = doc.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', m.couleur);
}
