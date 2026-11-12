// Verification locale d'une carte bancaire (aide a la saisie uniquement).
//
// SECURITE / PCI DSS : ces donnees ne sont JAMAIS envoyees a l'API
// SenYummies ni stockees (ni localStorage, ni commande). Quand le
// prestataire de paiement sera choisi, la saisie passera par ses champs
// securises (iframe / tokenisation) et seul un jeton opaque transitera.

export const chiffres = (s) => String(s || '').replace(/\D/g, '');

export function marqueCarte(numero) {
  const n = chiffres(numero);
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(n)) return 'mastercard';
  return null;
}

// "4111111111111111" -> "4111 1111 1111 1111"
export const formaterNumero = (s) => chiffres(s).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');

// "1228" -> "12/28"
export function formaterExpiration(s) {
  const n = chiffres(s).slice(0, 4);
  return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
}

export function luhn(numero) {
  const n = chiffres(numero);
  let somme = 0;
  for (let i = 0; i < n.length; i += 1) {
    let d = Number(n[n.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    somme += d;
  }
  return n.length > 0 && somme % 10 === 0;
}

export function validerCarte({ numero, titulaire, expiration, cvv }, maintenant = new Date()) {
  const e = {};
  const n = chiffres(numero);
  const marque = marqueCarte(n);
  if (!marque) e.carteNumero = 'Seules les cartes Visa et Mastercard sont acceptées.';
  else if (n.length !== 16 || !luhn(n)) e.carteNumero = 'Numéro de carte invalide.';

  if (!String(titulaire || '').trim()) e.carteTitulaire = 'Indiquez le nom inscrit sur la carte.';

  const exp = chiffres(expiration);
  const mois = Number(exp.slice(0, 2));
  const annee = 2000 + Number(exp.slice(2, 4));
  if (exp.length !== 4 || mois < 1 || mois > 12) e.carteExpiration = 'Date au format MM/AA.';
  else {
    const finDuMois = new Date(annee, mois, 1); // premier jour du mois suivant
    if (finDuMois <= maintenant) e.carteExpiration = 'Cette carte est expirée.';
  }

  if (!/^\d{3}$/.test(chiffres(cvv))) e.carteCvv = '3 chiffres au dos de la carte.';
  return e;
}
