// Outils du paiement en ligne.

// Cle d'idempotence d'un envoi de commande (en-tete Idempotency-Key).
export function nouvelleCle() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Navigateurs anciens : 128 bits aleatoires au format UUID v4.
  const o = new Uint8Array(16);
  crypto.getRandomValues(o);
  o[6] = (o[6] & 0x0f) | 0x40;
  o[8] = (o[8] & 0x3f) | 0x80;
  const h = [...o].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Page de paiement du prestataire renvoyee par le serveur : suivie seulement
// si c'est une vraie adresse https (jamais javascript:, data:, http clair).
// Null sinon (simulateur : pas de page, paiement deja confirme).
export function urlPaiementSure(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname ? u.href : null;
  } catch {
    return null;
  }
}
