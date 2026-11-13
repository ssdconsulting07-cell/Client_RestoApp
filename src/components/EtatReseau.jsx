import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { BASE_URL } from '../api/client';
import { ETATS, demarrerSurveillanceReseau, messageTransition } from '../utils/reseau';

// Toasts a chaque changement de connexion (hors ligne, instable, retablie)
// et bandeau permanent tant que l'app est hors ligne : un toast disparait,
// alors que l'information reste vraie tant que le reseau n'est pas revenu.
export default function EtatReseau() {
  const { showToast } = useToast();
  const [etat, setEtat] = useState(ETATS.EN_LIGNE);
  const { pathname } = useLocation();

  useEffect(
    () =>
      demarrerSurveillanceReseau({
        urlSonde: `${BASE_URL}/health`,
        onChange: (apres, avant) => {
          setEtat(apres);
          const m = messageTransition(avant, apres);
          if (m) showToast(m.texte, { type: m.type, duree: m.type === 'succes' ? 2600 : 4500 });
        },
      }),
    [showToast]
  );

  if (etat !== ETATS.HORS_LIGNE) return null;
  return (
    <div
      role="status"
      // Au-dessus des onglets du bas, ou de la barre d'action du tunnel de commande.
      className={`pointer-events-none fixed inset-x-0 z-[380] flex justify-center px-4 md:bottom-6 ${
        pathname === '/confirmation' ? 'bottom-[calc(7.75rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))]'
      }`}
    >
      <p className="flex items-center gap-2 rounded-full bg-ink/90 px-4 py-2 text-xs font-semibold text-white shadow-float backdrop-blur">
        <WifiOff size={15} className="shrink-0 text-red-300" aria-hidden="true" />
        Hors ligne · les informations peuvent ne pas être à jour
      </p>
    </div>
  );
}
