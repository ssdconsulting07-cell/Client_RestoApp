// Numeros senegalais : 9 chiffres (mobiles 70/71/75/76/77/78, fixes 33),
// avec ou sans indicatif +221 / 00221. Stockes au format international
// "+221XXXXXXXXX" (clientTelephone), qui est aussi la cle de retrouvaille
// des commandes sans compte.
export function normaliserTelephone(saisie) {
  let chiffres = String(saisie || '').replace(/[^\d]/g, '');
  if (chiffres.startsWith('00221')) chiffres = chiffres.slice(5);
  else if (chiffres.startsWith('221') && chiffres.length === 12) chiffres = chiffres.slice(3);
  if (!/^(7[015678]|33)\d{7}$/.test(chiffres)) return null;
  return `+221${chiffres}`;
}

// "+221771234567" -> "77 123 45 67"
export function formaterTelephone(tel) {
  const local = String(tel || '').replace(/^\+221/, '');
  if (local.length !== 9) return tel || '';
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}
