import { useState } from 'react';
import { LocateFixed, MapPin, X, ExternalLink, AlertTriangle } from 'lucide-react';

// Position GPS de livraison : le client partage sa position exacte en un
// geste. Elle complete la zone choisie (qui fixe le prix) et donne au livreur
// un itineraire jusqu'a la porte (Manager, espace Livreur : "Itineraire GPS").
// Facultative : le livreur peut toujours appeler le client.
const PRECISION_FAIBLE = 100; // metres

const MESSAGES = {
  1: 'Autorisation refusée. Activez la localisation pour ce site dans les réglages du navigateur.',
  2: 'Position introuvable. Activez le GPS du téléphone puis réessayez.',
  3: 'La localisation prend trop de temps. Réessayez à l’extérieur ou près d’une fenêtre.',
};

export const disponible = () =>
  typeof navigator !== 'undefined' && 'geolocation' in navigator && window.isSecureContext;

function apercuCarte({ latitude, longitude }) {
  const d = 0.004;
  const bbox = [longitude - d, latitude - d * 0.75, longitude + d, latitude + d * 0.75].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}

export default function PositionLivraison({ position, onChange }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);

  const localiser = () => {
    if (!disponible()) {
      setErreur('La localisation n’est pas disponible sur cet appareil ou ce navigateur.');
      return;
    }
    setErreur(null);
    setEnCours(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setEnCours(false);
        onChange({
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
          precision: Math.round(coords.accuracy),
        });
      },
      (err) => {
        setEnCours(false);
        setErreur(MESSAGES[err.code] || 'Impossible d’obtenir votre position.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  if (position) {
    const lien = `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`;
    return (
      <div className="overflow-hidden rounded-xl border border-success/30 bg-surface">
        <iframe
          title="Aperçu de votre position de livraison"
          src={apercuCarte(position)}
          loading="lazy"
          className="block h-40 w-full border-0 md:h-48"
        />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-3">
          <p className="flex w-full items-center gap-2 text-sm font-semibold text-success sm:w-auto">
            <MapPin size={16} className="shrink-0" aria-hidden="true" />
            Position enregistrée
            {position.precision ? <span className="whitespace-nowrap font-normal text-ink-light">(± {position.precision} m)</span> : null}
          </p>
          <span className="-ml-2 flex shrink-0 items-center gap-1 sm:ml-0">
            <a
              href={lien}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary"
            >
              Vérifier <ExternalLink size={13} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={localiser}
              className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-ink-light"
            >
              <LocateFixed size={13} aria-hidden="true" /> Actualiser
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Retirer la position"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-light hover:text-danger"
            >
              <X size={16} />
            </button>
          </span>
          {position.precision > PRECISION_FAIBLE && (
            <p className="flex w-full items-start gap-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Position approximative. Activez le GPS puis touchez « Actualiser » pour plus de précision.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={localiser}
        disabled={enCours}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
      >
        <LocateFixed size={18} className={enCours ? 'animate-pulse' : ''} aria-hidden="true" />
        {enCours ? 'Localisation en cours…' : 'Utiliser ma position actuelle'}
      </button>
      <p className="mt-1.5 text-xs text-ink-light">
        Recommandé : le livreur reçoit l’itinéraire exact jusqu’à votre porte.
      </p>
      {erreur && (
        <p className="mt-2 rounded-lg bg-red-50 p-2.5 text-xs text-danger" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}
