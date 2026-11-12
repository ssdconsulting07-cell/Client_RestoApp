import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Revient en haut de page a chaque changement d'ecran (sans quoi, sur mobile,
// on arrive sur le Panier ou Mes commandes au milieu de la page).
export default function ScrollEnHaut() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
