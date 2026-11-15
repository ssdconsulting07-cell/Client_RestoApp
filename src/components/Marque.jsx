import { marque, nomEnDeuxTons } from '../config/marque';

// Identite visuelle du restaurant (voir src/config/marque.js) : jamais de nom
// ni de couleur ecrits en dur dans les ecrans.

/** Monogramme (initiales sur la couleur de marque) ou logo s'il est configure. */
export function Monogramme({ className = '', texteClassName = '' }) {
  if (marque.logo) {
    return <img src={marque.logo} alt="" className={`shrink-0 object-contain ${className}`} />;
  }
  return (
    <span className={`flex shrink-0 items-center justify-center bg-primary font-bold text-white ${className}`}>
      <span className={texteClassName}>{marque.initiales}</span>
    </span>
  );
}

/** Nom en majuscules, la fin du nom dans la couleur d'accent (SEN + YUMMIES). */
export function NomMarque({ className = '', accentClassName = 'text-primary' }) {
  const { debut, accent } = nomEnDeuxTons();
  return (
    <span className={`uppercase ${className}`}>
      {debut}
      {accent && <span className={accentClassName}>{accent}</span>}
    </span>
  );
}
