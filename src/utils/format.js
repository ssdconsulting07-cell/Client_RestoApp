export const formatPrix = (montant) =>
  `${Number(montant).toLocaleString('fr-FR')} FCFA`;

export const formatTelephone = (tel) =>
  tel?.replace(/\s/g, '').replace(/^221/, '') || '';