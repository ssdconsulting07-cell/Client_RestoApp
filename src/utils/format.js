// Meme rendu que Manager_RestoApp ("3 500 F CFA"). L'espace insecable fine
// (U+202F) inseree par toLocaleString('fr-FR') est remplacee par une espace
// insecable classique, mieux rendue par les polices mobiles.
export const formatPrix = (montant) =>
  `${Number(montant || 0).toLocaleString('fr-FR').replace(/ /g, ' ')} F CFA`;
