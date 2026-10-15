import { useEffect, useRef, useState } from 'react';

/**
 * Simule une progression qui monte automatiquement jusqu'à `cible`.
 * Sur mobile, ça donne l'impression que la commande avance côté back-office.
 * Quand on aura l'API, il suffira de remplacer par le % réel.
 */
export default function useProgression(cible, options = {}) {
  const { intervalle = 800, pasMin = 1, pasMax = 4, demarrer = 0 } = options;
  const [valeur, setValeur] = useState(demarrer);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Si la cible est atteinte ou dépassée → on s'arrête
    if (valeur >= cible) {
      clearInterval(intervalRef.current);
      return;
    }

    // Sinon, on avance par petits pas
    intervalRef.current = setInterval(() => {
      setValeur((v) => {
        if (v >= cible) {
          clearInterval(intervalRef.current);
          return cible;
        }
        const pas = Math.floor(Math.random() * (pasMax - pasMin + 1)) + pasMin;
        return Math.min(v + pas, cible);
      });
    }, intervalle);

    return () => clearInterval(intervalRef.current);
  }, [cible, intervalle, pasMin, pasMax, valeur]);

  return valeur;
}